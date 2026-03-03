from datetime import datetime
from .. import db


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id', ondelete='CASCADE'), nullable=False)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    reason = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, reviewed, dismissed
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    video = db.relationship('Video', backref=db.backref('reports', lazy='dynamic'))
    reporter = db.relationship('User', foreign_keys=[reporter_id], backref=db.backref('reports_filed', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'video_id': self.video_id,
            'video_title': self.video.title if self.video else None,
            'reporter_id': self.reporter_id,
            'reporter_name': self.reporter.display_name if self.reporter else 'Anonymous',
            'reason': self.reason,
            'notes': self.notes,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }
