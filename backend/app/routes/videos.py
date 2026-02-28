import os
import logging
import resend
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from .. import db
from ..models.video import Video
from ..models.watch_later import WatchLater
from ..models.watch_history import WatchHistory
from ..models.reaction import Reaction

logger = logging.getLogger(__name__)
resend.api_key = os.environ.get('RESEND_API_KEY', '')

videos_bp = Blueprint('videos', __name__)


@videos_bp.route('/<int:video_id>', methods=['GET'])
def get_video(video_id):
    video = Video.query.get_or_404(video_id)

    if not video.is_published:
        try:
            verify_jwt_in_request(optional=True)
            uid = int(get_jwt_identity()) if get_jwt_identity() else None
            if uid != video.creator_id:
                return jsonify({'error': 'Video not found'}), 404
        except Exception:
            return jsonify({'error': 'Video not found'}), 404

    video.view_count += 1
    db.session.commit()
    return jsonify({'video': video.to_dict()})


@videos_bp.route('/watch-later', methods=['GET'])
@jwt_required()
def get_watch_later():
    user_id = int(get_jwt_identity())
    items = (
        WatchLater.query.filter_by(user_id=user_id)
        .order_by(WatchLater.added_at.desc())
        .all()
    )
    return jsonify({'watch_later': [item.to_dict() for item in items]})


@videos_bp.route('/<int:video_id>/watch-later', methods=['POST'])
@jwt_required()
def add_watch_later(video_id):
    user_id = int(get_jwt_identity())
    Video.query.get_or_404(video_id)

    existing = WatchLater.query.filter_by(user_id=user_id, video_id=video_id).first()
    if existing:
        return jsonify({'message': 'Already saved'}), 200

    wl = WatchLater(user_id=user_id, video_id=video_id)
    db.session.add(wl)
    db.session.commit()
    return jsonify({'message': 'Saved to Watch Later'}), 201


@videos_bp.route('/<int:video_id>/watch-later', methods=['DELETE'])
@jwt_required()
def remove_watch_later(video_id):
    user_id = int(get_jwt_identity())
    wl = WatchLater.query.filter_by(user_id=user_id, video_id=video_id).first()
    if not wl:
        return jsonify({'error': 'Not in Watch Later'}), 404
    db.session.delete(wl)
    db.session.commit()
    return jsonify({'message': 'Removed from Watch Later'})


@videos_bp.route('/<int:video_id>/watch-later/status', methods=['GET'])
@jwt_required()
def watch_later_status(video_id):
    user_id = int(get_jwt_identity())
    saved = WatchLater.query.filter_by(user_id=user_id, video_id=video_id).first() is not None
    return jsonify({'saved': saved})


@videos_bp.route('/<int:video_id>/progress', methods=['POST'])
@jwt_required()
def save_progress(video_id):
    user_id = int(get_jwt_identity())
    Video.query.get_or_404(video_id)
    data = request.get_json() or {}
    seconds = int(data.get('seconds', 0))

    entry = WatchHistory.query.filter_by(user_id=user_id, video_id=video_id).first()
    if entry:
        entry.progress_seconds = seconds
        entry.last_watched_at = db.func.now()
    else:
        entry = WatchHistory(user_id=user_id, video_id=video_id, progress_seconds=seconds)
        db.session.add(entry)
    db.session.commit()
    return jsonify({'saved': True})


@videos_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())
    completed_only = request.args.get('completed') == 'true'
    items = (
        WatchHistory.query.filter_by(user_id=user_id)
        .order_by(WatchHistory.last_watched_at.desc())
        .limit(100)
        .all()
    )
    results = []
    for item in items:
        d = item.to_dict()
        if not d:
            continue
        if completed_only and d.get('progress_pct', 0) < 95:
            continue
        results.append(d)
    return jsonify({'history': results[:50]})


@videos_bp.route('/continue-watching', methods=['GET'])
@jwt_required()
def continue_watching():
    user_id = int(get_jwt_identity())
    # Videos with any progress that aren't fully completed (< 95%)
    items = (
        WatchHistory.query
        .join(Video, WatchHistory.video_id == Video.id)
        .filter(
            WatchHistory.user_id == user_id,
            Video.is_published == True,
            Video.duration > 0,
            WatchHistory.progress_seconds > 0,
        )
        .order_by(WatchHistory.last_watched_at.desc())
        .limit(20)
        .all()
    )
    results = []
    for item in items:
        d = item.to_dict()
        if d and 0 < d.get('progress_pct', 0) < 95:
            results.append(d)
    return jsonify({'continue_watching': results})


@videos_bp.route('/<int:video_id>/progress', methods=['GET'])
@jwt_required()
def get_progress(video_id):
    user_id = int(get_jwt_identity())
    entry = WatchHistory.query.filter_by(user_id=user_id, video_id=video_id).first()
    return jsonify({'seconds': entry.progress_seconds if entry else 0})


@videos_bp.route('/history', methods=['DELETE'])
@jwt_required()
def clear_history():
    user_id = int(get_jwt_identity())
    WatchHistory.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({'message': 'History cleared'})


@videos_bp.route('/<int:video_id>/reaction', methods=['GET'])
@jwt_required()
def get_reaction(video_id):
    user_id = int(get_jwt_identity())
    Video.query.get_or_404(video_id)
    likes = Reaction.query.filter_by(video_id=video_id, reaction='like').count()
    dislikes = Reaction.query.filter_by(video_id=video_id, reaction='dislike').count()
    mine = Reaction.query.filter_by(user_id=user_id, video_id=video_id).first()
    return jsonify({'likes': likes, 'dislikes': dislikes, 'mine': mine.reaction if mine else None})


@videos_bp.route('/<int:video_id>/reaction', methods=['POST'])
@jwt_required()
def set_reaction(video_id):
    user_id = int(get_jwt_identity())
    Video.query.get_or_404(video_id)
    data = request.get_json() or {}
    reaction_type = data.get('reaction')
    if reaction_type not in ('like', 'dislike'):
        return jsonify({'error': 'Invalid reaction'}), 400

    existing = Reaction.query.filter_by(user_id=user_id, video_id=video_id).first()
    if existing:
        if existing.reaction == reaction_type:
            # Toggle off — remove reaction
            db.session.delete(existing)
            db.session.commit()
            likes = Reaction.query.filter_by(video_id=video_id, reaction='like').count()
            dislikes = Reaction.query.filter_by(video_id=video_id, reaction='dislike').count()
            return jsonify({'likes': likes, 'dislikes': dislikes, 'mine': None})
        existing.reaction = reaction_type
    else:
        r = Reaction(user_id=user_id, video_id=video_id, reaction=reaction_type)
        db.session.add(r)
    db.session.commit()
    likes = Reaction.query.filter_by(video_id=video_id, reaction='like').count()
    dislikes = Reaction.query.filter_by(video_id=video_id, reaction='dislike').count()
    return jsonify({'likes': likes, 'dislikes': dislikes, 'mine': reaction_type})


@videos_bp.route('/<int:video_id>/related', methods=['GET'])
def get_related(video_id):
    video = Video.query.get_or_404(video_id)
    related = (
        Video.query.filter(
            Video.is_published == True,
            Video.id != video_id,
            Video.genre == video.genre,
        )
        .order_by(Video.view_count.desc())
        .limit(10)
        .all()
    )
    return jsonify({'related': [v.to_dict() for v in related]})


@videos_bp.route('/<int:video_id>/report', methods=['POST'])
def report_video(video_id):
    video = Video.query.get_or_404(video_id)
    data = request.get_json() or {}
    reason = data.get('reason', 'Not specified')
    notes = data.get('notes', '').strip()[:500]

    reporter = 'Anonymous'
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            from ..models.user import User
            u = User.query.get(int(uid))
            if u:
                reporter = f'{u.display_name} ({u.email})'
    except Exception:
        pass

    base_url = os.environ.get('FRONTEND_URL', 'https://ministream.online')
    from_addr = os.environ.get('RESEND_FROM', 'MiniStream <noreply@ministream.online>')
    try:
        resend.Emails.send({
            'from': from_addr,
            'to': ['ministream.help@gmail.com'],
            'subject': f'[Report] {video.title}',
            'html': f'''
                <div style="font-family:sans-serif;max-width:480px;padding:24px;background:#0a0a0f;color:#e5e5e5;border-radius:12px;">
                    <h2 style="color:#f87171;margin-bottom:16px;">Content Report</h2>
                    <p><strong>Video:</strong> {video.title} (ID: {video.id})</p>
                    <p><strong>Creator:</strong> {video.creator.display_name if video.creator else '—'}</p>
                    <p><strong>Reason:</strong> {reason}</p>
                    <p><strong>Notes:</strong> {notes or '—'}</p>
                    <p><strong>Reported by:</strong> {reporter}</p>
                    <a href="{base_url}/watch/{video.id}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#f87171;color:#000;border-radius:8px;text-decoration:none;font-weight:700;">View Video</a>
                </div>
            ''',
        })
    except Exception as e:
        logger.error('Report email failed for video %s: %s', video_id, e)

    return jsonify({'message': 'Report submitted. Thank you.'})
