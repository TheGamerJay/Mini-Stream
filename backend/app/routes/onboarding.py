import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.user import User

onboarding_bp = Blueprint('onboarding', __name__)

VALID_GENRES = [
    'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
    'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
    'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen',
    'Experimental',
]


@onboarding_bp.route('', methods=['POST'])
@jwt_required()
def complete_onboarding():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    genres = data.get('genres', [])

    if not isinstance(genres, list):
        return jsonify({'error': 'genres must be a list'}), 400

    valid = [g for g in genres if g in VALID_GENRES]
    user.preferred_genres = json.dumps(valid)
    user.onboarding_done = True
    db.session.commit()
    return jsonify({'message': 'Onboarding complete', 'user': user.to_dict()})
