from datetime import datetime
from .. import db


class Donation(db.Model):
    __tablename__ = 'donations'

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)  # stored but symbolic (no real payment)
    message = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    donor = db.relationship('User', foreign_keys=[donor_id], backref='donations_sent')
    creator = db.relationship('User', foreign_keys=[creator_id], backref='donations_received')

    def to_dict(self):
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'donor_name': self.donor.display_name if self.donor else 'Anonymous',
            'donor_avatar': self.donor.avatar_url if self.donor else None,
            'creator_id': self.creator_id,
            'amount': float(self.amount),
            'message': self.message,
            'created_at': self.created_at.isoformat(),
        }
