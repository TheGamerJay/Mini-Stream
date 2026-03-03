from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.playlist import Playlist, PlaylistItem
from ..models.video import Video

playlists_bp = Blueprint('playlists', __name__)


@playlists_bp.route('', methods=['GET'])
@jwt_required()
def get_playlists():
    user_id = int(get_jwt_identity())
    playlists = Playlist.query.filter_by(user_id=user_id).order_by(Playlist.created_at.desc()).all()
    return jsonify({'playlists': [p.to_dict() for p in playlists]})


@playlists_bp.route('', methods=['POST'])
@jwt_required()
def create_playlist():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    pl = Playlist(
        user_id=user_id,
        name=name[:100],
        description=(data.get('description') or '')[:500],
        is_public=bool(data.get('is_public', False)),
    )
    db.session.add(pl)
    db.session.commit()
    return jsonify({'playlist': pl.to_dict()}), 201


@playlists_bp.route('/<int:playlist_id>', methods=['GET'])
@jwt_required()
def get_playlist(playlist_id):
    user_id = int(get_jwt_identity())
    pl = Playlist.query.get_or_404(playlist_id)
    if pl.user_id != user_id and not pl.is_public:
        return jsonify({'error': 'Forbidden'}), 403
    return jsonify({'playlist': pl.to_dict(include_items=True)})


@playlists_bp.route('/<int:playlist_id>', methods=['PUT'])
@jwt_required()
def update_playlist(playlist_id):
    user_id = int(get_jwt_identity())
    pl = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first_or_404()
    data = request.get_json() or {}
    if 'name' in data:
        pl.name = (data['name'] or '').strip()[:100]
    if 'description' in data:
        pl.description = (data['description'] or '')[:500]
    if 'is_public' in data:
        pl.is_public = bool(data['is_public'])
    db.session.commit()
    return jsonify({'playlist': pl.to_dict()})


@playlists_bp.route('/<int:playlist_id>', methods=['DELETE'])
@jwt_required()
def delete_playlist(playlist_id):
    user_id = int(get_jwt_identity())
    pl = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first_or_404()
    db.session.delete(pl)
    db.session.commit()
    return jsonify({'message': 'Deleted'})


@playlists_bp.route('/<int:playlist_id>/items', methods=['POST'])
@jwt_required()
def add_to_playlist(playlist_id):
    user_id = int(get_jwt_identity())
    pl = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first_or_404()
    data = request.get_json() or {}
    video_id = data.get('video_id')
    Video.query.get_or_404(video_id)

    existing = PlaylistItem.query.filter_by(playlist_id=playlist_id, video_id=video_id).first()
    if existing:
        return jsonify({'message': 'Already in playlist'})

    max_pos = db.session.query(db.func.max(PlaylistItem.position)).filter_by(playlist_id=playlist_id).scalar() or 0
    item = PlaylistItem(playlist_id=playlist_id, video_id=video_id, position=max_pos + 1)
    db.session.add(item)
    db.session.commit()
    return jsonify({'message': 'Added', 'item_count': pl.items.count()}), 201


@playlists_bp.route('/<int:playlist_id>/items/<int:video_id>', methods=['DELETE'])
@jwt_required()
def remove_from_playlist(playlist_id, video_id):
    user_id = int(get_jwt_identity())
    pl = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first_or_404()
    item = PlaylistItem.query.filter_by(playlist_id=playlist_id, video_id=video_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Removed', 'item_count': pl.items.count()})
