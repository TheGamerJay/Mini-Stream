import os
import logging
import resend
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from .. import db
from ..models.video import Video
from ..models.watch_later import WatchLater

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
