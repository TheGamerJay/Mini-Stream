from datetime import datetime
from .. import db


class Announcement(db.Model):
    __tablename__ = 'announcements'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(20), default='info', nullable=False)  # info, warning, success
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'type': self.type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
        }
