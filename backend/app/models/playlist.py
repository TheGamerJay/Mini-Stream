from datetime import datetime
from .. import db


class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    items = db.relationship('PlaylistItem', backref='playlist', lazy='dynamic',
                            order_by='PlaylistItem.position', cascade='all, delete-orphan')

    def to_dict(self, include_items=False):
        d = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'is_public': self.is_public,
            'item_count': self.items.count(),
            'created_at': self.created_at.isoformat(),
        }
        if include_items:
            d['items'] = [i.to_dict() for i in self.items.all()]
        return d


class PlaylistItem(db.Model):
    __tablename__ = 'playlist_items'

    id = db.Column(db.Integer, primary_key=True)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.id', ondelete='CASCADE'), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id', ondelete='CASCADE'), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (db.UniqueConstraint('playlist_id', 'video_id', name='uq_playlist_video'),)

    def to_dict(self):
        return {
            'id': self.id,
            'playlist_id': self.playlist_id,
            'video_id': self.video_id,
            'video': self.video.to_dict() if self.video else None,
            'position': self.position,
            'added_at': self.added_at.isoformat(),
        }
