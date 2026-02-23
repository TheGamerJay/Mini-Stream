from datetime import datetime
from .. import db


class Video(db.Model):
    __tablename__ = 'videos'

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    series_id = db.Column(db.Integer, db.ForeignKey('series.id'), nullable=True)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    genre = db.Column(db.String(50), nullable=False)
    language = db.Column(db.String(50), nullable=False, default='English')

    video_url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    cloudinary_public_id = db.Column(db.String(255), nullable=True)

    duration = db.Column(db.Integer, nullable=True)  # seconds
    episode_number = db.Column(db.Integer, nullable=True)
    season_number = db.Column(db.Integer, default=1)

    view_count = db.Column(db.Integer, default=0, nullable=False)
    is_published = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    watch_later_entries = db.relationship(
        'WatchLater', backref='video', lazy='dynamic'
    )

    def format_duration(self):
        if not self.duration:
            return None
        m, s = divmod(self.duration, 60)
        h, m = divmod(m, 60)
        if h:
            return f'{h}h {m}m'
        return f'{m}m {s}s'

    def to_dict(self):
        return {
            'id': self.id,
            'creator_id': self.creator_id,
            'creator_name': self.creator.display_name if self.creator else None,
            'series_id': self.series_id,
            'series_title': self.series.title if self.series else None,
            'title': self.title,
            'description': self.description,
            'genre': self.genre,
            'language': self.language,
            'video_url': self.video_url,
            'thumbnail_url': self.thumbnail_url,
            'duration': self.duration,
            'duration_formatted': self.format_duration(),
            'episode_number': self.episode_number,
            'season_number': self.season_number,
            'view_count': self.view_count,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat(),
        }
