from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.notification import Notification

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    notifs = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .paginate(page=page, per_page=20, error_out=False)
    )
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({
        'notifications': [n.to_dict() for n in notifs.items],
        'unread_count': unread,
        'page': page,
        'pages': notifs.pages,
    })


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({'unread_count': count})


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All marked as read'})


@notifications_bp.route('/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'})
