from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.follow import Follow
from ..models.user import User
from ..models.notification import Notification

follows_bp = Blueprint('follows', __name__)


@follows_bp.route('/<int:creator_id>/follow', methods=['POST'])
@jwt_required()
def follow_creator(creator_id):
    user_id = int(get_jwt_identity())
    if user_id == creator_id:
        return jsonify({'error': 'Cannot follow yourself'}), 400
    creator = User.query.get_or_404(creator_id)
    if not creator.is_creator:
        return jsonify({'error': 'Not a creator'}), 400

    existing = Follow.query.filter_by(follower_id=user_id, followed_id=creator_id).first()
    if existing:
        return jsonify({'following': True, 'follower_count': _count(creator_id)})

    follow = Follow(follower_id=user_id, followed_id=creator_id)
    db.session.add(follow)

    # Notify creator
    follower = User.query.get(user_id)
    notif = Notification(
        user_id=creator_id,
        type='follow',
        message=f'{follower.display_name} started following you',
        link=f'/creator/{user_id}',
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify({'following': True, 'follower_count': _count(creator_id)})


@follows_bp.route('/<int:creator_id>/follow', methods=['DELETE'])
@jwt_required()
def unfollow_creator(creator_id):
    user_id = int(get_jwt_identity())
    follow = Follow.query.filter_by(follower_id=user_id, followed_id=creator_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
    return jsonify({'following': False, 'follower_count': _count(creator_id)})


@follows_bp.route('/<int:creator_id>/follow/status', methods=['GET'])
@jwt_required()
def follow_status(creator_id):
    user_id = int(get_jwt_identity())
    following = Follow.query.filter_by(follower_id=user_id, followed_id=creator_id).first() is not None
    return jsonify({'following': following, 'follower_count': _count(creator_id)})


@follows_bp.route('/following', methods=['GET'])
@jwt_required()
def get_following():
    user_id = int(get_jwt_identity())
    follows = Follow.query.filter_by(follower_id=user_id).order_by(Follow.created_at.desc()).all()
    result = []
    for f in follows:
        creator = User.query.get(f.followed_id)
        if creator:
            result.append({
                'creator_id': creator.id,
                'display_name': creator.display_name,
                'avatar_url': creator.avatar_url,
                'follower_count': _count(creator.id),
            })
    return jsonify({'following': result})


def _count(creator_id):
    return Follow.query.filter_by(followed_id=creator_id).count()
