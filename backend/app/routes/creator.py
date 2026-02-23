from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import cloudinary.uploader
from .. import db
from ..models.user import User
from ..models.video import Video
from ..models.series import Series

creator_bp = Blueprint('creator', __name__)


def require_creator(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_creator:
            return jsonify({'error': 'Creator account required'}), 403
        return f(*args, **kwargs)
    return decorated


@creator_bp.route('/upload', methods=['POST'])
@require_creator
def upload_video():
    user_id = get_jwt_identity()

    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    thumbnail_file = request.files.get('thumbnail')

    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    genre = request.form.get('genre', '').strip()
    language = request.form.get('language', 'English').strip()
    series_id = request.form.get('series_id', type=int)
    episode_number = request.form.get('episode_number', type=int)
    season_number = request.form.get('season_number', 1, type=int)

    if not title or not genre or not description or not language:
        return jsonify({'error': 'Title, genre, language, and description are required'}), 400

    if series_id:
        series = Series.query.filter_by(id=series_id, creator_id=user_id).first()
        if not series:
            return jsonify({'error': 'Series not found or not yours'}), 404

    try:
        video_result = cloudinary.uploader.upload(
            video_file,
            resource_type='video',
            folder='ministream/videos',
            chunk_size=6_000_000,
        )
    except Exception as e:
        return jsonify({'error': f'Video upload failed: {str(e)}'}), 500

    thumbnail_url = None
    if thumbnail_file:
        try:
            thumb_result = cloudinary.uploader.upload(
                thumbnail_file, folder='ministream/thumbnails'
            )
            thumbnail_url = thumb_result['secure_url']
        except Exception:
            pass

    video = Video(
        creator_id=user_id,
        series_id=series_id,
        title=title,
        description=description,
        genre=genre,
        language=language,
        video_url=video_result['secure_url'],
        thumbnail_url=thumbnail_url,
        cloudinary_public_id=video_result['public_id'],
        duration=int(video_result.get('duration', 0) or 0),
        episode_number=episode_number,
        season_number=season_number,
    )
    db.session.add(video)
    db.session.commit()
    return jsonify({'video': video.to_dict()}), 201


@creator_bp.route('/series', methods=['POST'])
@require_creator
def create_series():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('title') or not data.get('genre') or not data.get('language') or not data.get('description'):
        return jsonify({'error': 'Title, genre, language, and description are required'}), 400

    series = Series(
        creator_id=user_id,
        title=data['title'].strip(),
        description=data.get('description', '').strip(),
        genre=data['genre'],
        language=data.get('language', 'English'),
        banner_url=data.get('banner_url'),
        thumbnail_url=data.get('thumbnail_url'),
    )
    db.session.add(series)
    db.session.commit()
    return jsonify({'series': series.to_dict()}), 201


@creator_bp.route('/series/<int:series_id>', methods=['PUT'])
@require_creator
def update_series(series_id):
    user_id = get_jwt_identity()
    series = Series.query.filter_by(id=series_id, creator_id=user_id).first_or_404()
    data = request.get_json()

    if data.get('title'):
        series.title = data['title'].strip()
    if data.get('description') is not None:
        series.description = data['description']
    if data.get('genre'):
        series.genre = data['genre']
    if data.get('is_published') is not None:
        series.is_published = data['is_published']

    db.session.commit()
    return jsonify({'series': series.to_dict()})


@creator_bp.route('/series/<int:series_id>/banner', methods=['POST'])
@require_creator
def upload_series_banner(series_id):
    user_id = get_jwt_identity()
    series = Series.query.filter_by(id=series_id, creator_id=user_id).first_or_404()

    if 'banner' not in request.files and 'thumbnail' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    updates = {}
    if 'banner' in request.files:
        result = cloudinary.uploader.upload(
            request.files['banner'], folder='ministream/banners'
        )
        series.banner_url = result['secure_url']
        updates['banner_url'] = series.banner_url

    if 'thumbnail' in request.files:
        result = cloudinary.uploader.upload(
            request.files['thumbnail'], folder='ministream/thumbnails'
        )
        series.thumbnail_url = result['secure_url']
        updates['thumbnail_url'] = series.thumbnail_url

    db.session.commit()
    return jsonify(updates)


@creator_bp.route('/videos', methods=['GET'])
@require_creator
def get_my_videos():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    paginated = (
        Video.query.filter_by(creator_id=user_id)
        .order_by(Video.created_at.desc())
        .paginate(page=page, per_page=20, error_out=False)
    )
    return jsonify({
        'videos': [v.to_dict() for v in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
    })


@creator_bp.route('/series-list', methods=['GET'])
@require_creator
def get_my_series():
    user_id = get_jwt_identity()
    series = (
        Series.query.filter_by(creator_id=user_id)
        .order_by(Series.created_at.desc())
        .all()
    )
    return jsonify({'series': [s.to_dict() for s in series]})


@creator_bp.route('/videos/<int:video_id>', methods=['PUT'])
@require_creator
def update_video(video_id):
    user_id = get_jwt_identity()
    video = Video.query.filter_by(id=video_id, creator_id=user_id).first_or_404()
    data = request.get_json()

    if data.get('title'):
        video.title = data['title'].strip()
    if data.get('description') is not None:
        video.description = data['description']
    if data.get('genre'):
        video.genre = data['genre']
    if data.get('is_published') is not None:
        video.is_published = data['is_published']
    if data.get('episode_number') is not None:
        video.episode_number = data['episode_number']
    if data.get('season_number') is not None:
        video.season_number = data['season_number']

    db.session.commit()
    return jsonify({'video': video.to_dict()})


@creator_bp.route('/videos/<int:video_id>', methods=['DELETE'])
@require_creator
def delete_video(video_id):
    user_id = get_jwt_identity()
    video = Video.query.filter_by(id=video_id, creator_id=user_id).first_or_404()

    if video.cloudinary_public_id:
        try:
            cloudinary.uploader.destroy(
                video.cloudinary_public_id, resource_type='video'
            )
        except Exception:
            pass

    db.session.delete(video)
    db.session.commit()
    return jsonify({'message': 'Video deleted'})


@creator_bp.route('/stats', methods=['GET'])
@require_creator
def get_stats():
    user_id = get_jwt_identity()
    total_videos = Video.query.filter_by(creator_id=user_id).count()
    total_views = (
        db.session.query(db.func.sum(Video.view_count))
        .filter_by(creator_id=user_id)
        .scalar()
        or 0
    )
    total_series = Series.query.filter_by(creator_id=user_id).count()
    recent_videos = (
        Video.query.filter_by(creator_id=user_id)
        .order_by(Video.created_at.desc())
        .limit(5)
        .all()
    )
    return jsonify({
        'total_videos': total_videos,
        'total_views': int(total_views),
        'total_series': total_series,
        'recent_videos': [v.to_dict() for v in recent_videos],
    })
