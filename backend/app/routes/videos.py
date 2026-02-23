from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from .. import db
from ..models.video import Video
from ..models.watch_later import WatchLater

videos_bp = Blueprint('videos', __name__)


@videos_bp.route('/<int:video_id>', methods=['GET'])
def get_video(video_id):
    video = Video.query.get_or_404(video_id)

    if not video.is_published:
        try:
            verify_jwt_in_request(optional=True)
            uid = get_jwt_identity()
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
    user_id = get_jwt_identity()
    items = (
        WatchLater.query.filter_by(user_id=user_id)
        .order_by(WatchLater.added_at.desc())
        .all()
    )
    return jsonify({'watch_later': [item.to_dict() for item in items]})


@videos_bp.route('/<int:video_id>/watch-later', methods=['POST'])
@jwt_required()
def add_watch_later(video_id):
    user_id = get_jwt_identity()
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
    user_id = get_jwt_identity()
    wl = WatchLater.query.filter_by(user_id=user_id, video_id=video_id).first()
    if not wl:
        return jsonify({'error': 'Not in Watch Later'}), 404
    db.session.delete(wl)
    db.session.commit()
    return jsonify({'message': 'Removed from Watch Later'})


@videos_bp.route('/<int:video_id>/watch-later/status', methods=['GET'])
@jwt_required()
def watch_later_status(video_id):
    user_id = get_jwt_identity()
    saved = WatchLater.query.filter_by(user_id=user_id, video_id=video_id).first() is not None
    return jsonify({'saved': saved})
