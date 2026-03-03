from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import func
from .. import db
from ..models.rating import Rating
from ..models.video import Video

ratings_bp = Blueprint('ratings', __name__)


@ratings_bp.route('/<int:video_id>/rating', methods=['GET'])
def get_rating(video_id):
    Video.query.get_or_404(video_id)
    avg = db.session.query(func.avg(Rating.stars)).filter_by(video_id=video_id).scalar()
    count = Rating.query.filter_by(video_id=video_id).count()

    mine = None
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            r = Rating.query.filter_by(user_id=int(uid), video_id=video_id).first()
            mine = r.stars if r else None
    except Exception:
        pass

    return jsonify({
        'average': round(float(avg), 1) if avg else None,
        'count': count,
        'mine': mine,
    })


@ratings_bp.route('/<int:video_id>/rating', methods=['POST'])
@jwt_required()
def set_rating(video_id):
    user_id = int(get_jwt_identity())
    Video.query.get_or_404(video_id)
    data = request.get_json() or {}
    stars = data.get('stars')
    if not isinstance(stars, int) or stars < 1 or stars > 5:
        return jsonify({'error': 'stars must be 1-5'}), 400

    existing = Rating.query.filter_by(user_id=user_id, video_id=video_id).first()
    if existing:
        existing.stars = stars
    else:
        db.session.add(Rating(user_id=user_id, video_id=video_id, stars=stars))
    db.session.commit()

    avg = db.session.query(func.avg(Rating.stars)).filter_by(video_id=video_id).scalar()
    count = Rating.query.filter_by(video_id=video_id).count()
    return jsonify({'average': round(float(avg), 1), 'count': count, 'mine': stars})


@ratings_bp.route('/<int:video_id>/rating', methods=['DELETE'])
@jwt_required()
def delete_rating(video_id):
    user_id = int(get_jwt_identity())
    r = Rating.query.filter_by(user_id=user_id, video_id=video_id).first()
    if r:
        db.session.delete(r)
        db.session.commit()
    avg = db.session.query(func.avg(Rating.stars)).filter_by(video_id=video_id).scalar()
    count = Rating.query.filter_by(video_id=video_id).count()
    return jsonify({'average': round(float(avg), 1) if avg else None, 'count': count, 'mine': None})
