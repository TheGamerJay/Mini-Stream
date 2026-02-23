import os
import re
import uuid
import shutil
import tempfile
import subprocess
import logging
import cloudinary.uploader
import imageio_ffmpeg
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.video import Video
from ..models.user import User

logger = logging.getLogger(__name__)
studio_bp = Blueprint('studio', __name__)

MAX_CLIPS = 20


def _get_duration(ffmpeg_exe, path):
    """Parse video duration in seconds from ffmpeg stderr."""
    result = subprocess.run(
        [ffmpeg_exe, '-i', path],
        capture_output=True, text=True
    )
    m = re.search(r'Duration:\s*(\d+):(\d+):(\d+\.\d+)', result.stderr)
    if m:
        h, mins, s = int(m.group(1)), int(m.group(2)), float(m.group(3))
        return int(h * 3600 + mins * 60 + s)
    return 0


@studio_bp.route('/merge', methods=['POST'])
@jwt_required()
def merge_clips():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_creator:
        return jsonify({'error': 'Creator account required'}), 403

    files = request.files.getlist('clips')
    if len(files) < 2:
        return jsonify({'error': 'Upload at least 2 clips to merge.'}), 400
    if len(files) > MAX_CLIPS:
        return jsonify({'error': f'Maximum {MAX_CLIPS} clips at a time.'}), 400

    tmpdir = tempfile.mkdtemp()
    try:
        # Save uploaded clips to temp dir
        clip_paths = []
        for i, f in enumerate(files):
            ext = os.path.splitext(f.filename)[1].lower() or '.mp4'
            path = os.path.join(tmpdir, f'{i:03d}{ext}')
            f.save(path)
            clip_paths.append(path)

        # Write ffmpeg concat list
        list_path = os.path.join(tmpdir, 'list.txt')
        with open(list_path, 'w') as lf:
            for p in clip_paths:
                lf.write(f"file '{p}'\n")

        output_path = os.path.join(tmpdir, f'merged_{uuid.uuid4().hex}.mp4')
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

        # Try stream-copy first (fast, works when all clips share the same codec/resolution)
        result = subprocess.run(
            [ffmpeg_exe, '-f', 'concat', '-safe', '0', '-i', list_path,
             '-c', 'copy', '-y', output_path],
            capture_output=True, timeout=600
        )

        # If stream-copy fails, re-encode to H.264/AAC (handles mixed codecs / Sora clips)
        if result.returncode != 0:
            logger.info('Stream-copy failed, re-encoding: %s', result.stderr.decode()[-300:])
            result = subprocess.run(
                [ffmpeg_exe, '-f', 'concat', '-safe', '0', '-i', list_path,
                 '-vf', 'scale=1920:-2', '-c:v', 'libx264', '-preset', 'fast',
                 '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-y', output_path],
                capture_output=True, timeout=600
            )
            if result.returncode != 0:
                logger.error('Re-encode failed: %s', result.stderr.decode()[-500:])
                return jsonify({'error': 'Merge failed. Make sure all clips are valid MP4/WebM files.'}), 500

        duration = _get_duration(ffmpeg_exe, output_path)

        # Upload merged file to Cloudinary
        upload_result = cloudinary.uploader.upload(
            output_path,
            resource_type='video',
            folder='ministream/merged',
            public_id=f'merged_{uuid.uuid4().hex}',
        )

        return jsonify({
            'video_url': upload_result['secure_url'],
            'duration': duration,
            'clip_count': len(files),
        })

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Merge timed out. Try fewer or shorter clips.'}), 500
    except Exception as e:
        logger.exception('Studio merge error: %s', e)
        return jsonify({'error': 'An unexpected error occurred during merge.'}), 500
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


@studio_bp.route('/publish', methods=['POST'])
@jwt_required()
def publish_merged():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_creator:
        return jsonify({'error': 'Creator account required'}), 403

    data = request.get_json() or {}
    for field in ('title', 'description', 'genre', 'language', 'video_url'):
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    video = Video(
        creator_id=user_id,
        title=data['title'].strip(),
        description=data['description'].strip(),
        genre=data['genre'],
        language=data['language'],
        video_type=data.get('video_type', 'Standalone'),
        content_rating=data.get('content_rating', 'General'),
        video_url=data['video_url'],
        thumbnail_url=data.get('thumbnail_url') or None,
        duration=int(data.get('duration', 0)),
        is_published=True,
    )
    if data.get('series_id'):
        video.series_id = int(data['series_id'])
        if data.get('episode_number'):
            video.episode_number = int(data['episode_number'])
        if data.get('season_number'):
            video.season_number = int(data['season_number'])

    db.session.add(video)
    db.session.commit()
    return jsonify({'video': video.to_dict()}), 201
