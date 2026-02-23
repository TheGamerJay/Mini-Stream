from datetime import datetime
from .. import db


class WatchLater(db.Model):
    __tablename__ = 'watch_later'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'video_id', name='uq_watch_later_user_video'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'video_id': self.video_id,
            'video': self.video.to_dict() if self.video else None,
            'added_at': self.added_at.isoformat(),
        }
