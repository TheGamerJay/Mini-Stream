import os
from flask import Blueprint, request, jsonify
from functools import wraps
from .. import db
from ..models.user import User
from ..models.video import Video
from ..models.series import Series

admin_bp = Blueprint('admin', __name__)

ADMIN_EMAIL = 'ministream.help@gmail.com'
ADMIN_PASSWORD = 'Yariel@13'
ADMIN_TOKEN = 'ministream-admin-secret-2025'


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('X-Admin-Token')
        if token != ADMIN_TOKEN:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request'}), 400
    if data.get('email') == ADMIN_EMAIL and data.get('password') == ADMIN_PASSWORD:
        return jsonify({'token': ADMIN_TOKEN})
    return jsonify({'error': 'Invalid credentials'}), 401


@admin_bp.route('/stats', methods=['GET'])
@require_admin
def admin_stats():
    total_users = User.query.count()
    total_creators = User.query.filter_by(is_creator=True).count()
    total_videos = Video.query.count()
    total_published_videos = Video.query.filter_by(is_published=True).count()
    total_series = Series.query.count()
    total_views = db.session.query(db.func.sum(Video.view_count)).scalar() or 0
    recent_signups = (
        User.query.order_by(User.created_at.desc()).limit(5).all()
    )
    return jsonify({
        'total_users': total_users,
        'total_creators': total_creators,
        'total_videos': total_videos,
        'total_published_videos': total_published_videos,
        'total_series': total_series,
        'total_views': int(total_views),
        'recent_signups': [
            {
                'id': u.id,
                'email': u.email,
                'display_name': u.display_name,
                'is_creator': u.is_creator,
                'created_at': u.created_at.isoformat(),
            }
            for u in recent_signups
        ],
    })


@admin_bp.route('/users', methods=['GET'])
@require_admin
def admin_users():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    query = User.query
    if search:
        query = query.filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                User.display_name.ilike(f'%{search}%'),
            )
        )
    paginated = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        'users': [
            {
                'id': u.id,
                'email': u.email,
                'display_name': u.display_name,
                'is_creator': u.is_creator,
                'google_id': u.google_id,
                'created_at': u.created_at.isoformat(),
                'video_count': u.videos.count(),
            }
            for u in paginated.items
        ],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/videos', methods=['GET'])
@require_admin
def admin_videos():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    query = Video.query
    if search:
        query = query.filter(Video.title.ilike(f'%{search}%'))
    paginated = query.order_by(Video.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        'videos': [
            {
                'id': v.id,
                'title': v.title,
                'creator_name': v.creator.display_name if v.creator else None,
                'genre': v.genre,
                'video_type': v.video_type,
                'content_rating': v.content_rating,
                'view_count': v.view_count,
                'is_published': v.is_published,
                'duration': v.duration,
                'created_at': v.created_at.isoformat(),
            }
            for v in paginated.items
        ],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/series', methods=['GET'])
@require_admin
def admin_series():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    query = Series.query
    if search:
        query = query.filter(Series.title.ilike(f'%{search}%'))
    paginated = query.order_by(Series.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        'series': [
            {
                'id': s.id,
                'title': s.title,
                'creator_name': s.creator.display_name if s.creator else None,
                'genre': s.genre,
                'content_rating': s.content_rating,
                'episode_count': s.episodes.count(),
                'is_published': s.is_published,
                'created_at': s.created_at.isoformat(),
            }
            for s in paginated.items
        ],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
def admin_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})


@admin_bp.route('/videos/<int:video_id>', methods=['DELETE'])
@require_admin
def admin_delete_video(video_id):
    video = Video.query.get_or_404(video_id)
    db.session.delete(video)
    db.session.commit()
    return jsonify({'message': 'Video deleted'})
