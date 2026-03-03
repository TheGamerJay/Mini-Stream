from datetime import datetime
from .. import db


class Rating(db.Model):
    __tablename__ = 'ratings'
    __table_args__ = (db.UniqueConstraint('user_id', 'video_id', name='uq_user_video_rating'),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id', ondelete='CASCADE'), nullable=False)
    stars = db.Column(db.Integer, nullable=False)  # 1-5
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'video_id': self.video_id,
            'stars': self.stars,
            'created_at': self.created_at.isoformat(),
        }
