from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from .. import db
from ..models.comment import Comment
from ..models.video import Video
from ..models.notification import Notification

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('/<int:video_id>/comments', methods=['GET'])
def get_comments(video_id):
    Video.query.get_or_404(video_id)
    page = request.args.get('page', 1, type=int)
    per_page = 20
    top_level = (
        Comment.query
        .filter_by(video_id=video_id, parent_id=None)
        .order_by(Comment.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    return jsonify({
        'comments': [c.to_dict(include_replies=True) for c in top_level.items],
        'total': top_level.total,
        'page': page,
        'pages': top_level.pages,
    })


@comments_bp.route('/<int:video_id>/comments', methods=['POST'])
@jwt_required()
def post_comment(video_id):
    user_id = int(get_jwt_identity())
    video = Video.query.get_or_404(video_id)
    data = request.get_json() or {}
    content = (data.get('content') or '').strip()
    parent_id = data.get('parent_id')

    if not content or len(content) > 2000:
        return jsonify({'error': 'Content required (max 2000 chars)'}), 400

    if parent_id:
        parent = Comment.query.get(parent_id)
        if not parent or parent.video_id != video_id:
            return jsonify({'error': 'Invalid parent comment'}), 400

    comment = Comment(video_id=video_id, user_id=user_id, content=content, parent_id=parent_id)
    db.session.add(comment)

    # Notify video creator on new top-level comment
    if not parent_id and video.creator_id != user_id:
        notif = Notification(
            user_id=video.creator_id,
            type='comment',
            message=f'Someone commented on "{video.title}"',
            link=f'/watch/{video_id}',
        )
        db.session.add(notif)

    # Notify parent comment author on reply
    if parent_id and parent.user_id != user_id:
        notif = Notification(
            user_id=parent.user_id,
            type='reply',
            message=f'Someone replied to your comment on "{video.title}"',
            link=f'/watch/{video_id}',
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify({'comment': comment.to_dict(include_replies=False)}), 201


@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get_or_404(comment_id)
    # Allow author or video creator to delete
    if comment.user_id != user_id and comment.video.creator_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
