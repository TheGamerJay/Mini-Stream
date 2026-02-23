from datetime import datetime
from .. import db


class WatchHistory(db.Model):
    __tablename__ = 'watch_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'), nullable=False)
    progress_seconds = db.Column(db.Integer, default=0, nullable=False)
    last_watched_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'video_id', name='uq_watch_history_user_video'),
    )

    def to_dict(self):
        video = self.video
        if not video:
            return None
        d = video.to_dict()
        d['progress_seconds'] = self.progress_seconds
        d['last_watched_at'] = self.last_watched_at.isoformat()
        # Percent complete (0-100)
        if video.duration and video.duration > 0:
            d['progress_pct'] = min(100, round(self.progress_seconds / video.duration * 100))
        else:
            d['progress_pct'] = 0
        return d
