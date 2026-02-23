from datetime import datetime
from .. import db

GENRES = [
    'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
    'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
    'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen',
    'Experimental',
]

LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Japanese']


class Series(db.Model):
    __tablename__ = 'series'

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    genre = db.Column(db.String(50), nullable=False)
    language = db.Column(db.String(50), nullable=False, default='English')
    banner_url = db.Column(db.String(500), nullable=True)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    episodes = db.relationship(
        'Video',
        backref='series',
        lazy='dynamic',
        foreign_keys='Video.series_id',
    )

    def to_dict(self, include_episodes=False):
        from .video import Video

        data = {
            'id': self.id,
            'creator_id': self.creator_id,
            'creator_name': self.creator.display_name if self.creator else None,
            'title': self.title,
            'description': self.description,
            'genre': self.genre,
            'language': self.language,
            'banner_url': self.banner_url,
            'thumbnail_url': self.thumbnail_url,
            'episode_count': self.episodes.count(),
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat(),
        }
        if include_episodes:
            data['episodes'] = [
                ep.to_dict()
                for ep in self.episodes.order_by(
                    Video.season_number, Video.episode_number
                ).all()
            ]
        return data
