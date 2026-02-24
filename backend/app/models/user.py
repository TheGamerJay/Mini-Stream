from datetime import datetime
from .. import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    display_name = db.Column(db.String(100), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    is_creator = db.Column(db.Boolean, default=False, nullable=False)
    website = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    videos = db.relationship('Video', backref='creator', lazy='dynamic')
    series = db.relationship('Series', backref='creator', lazy='dynamic')
    watch_later = db.relationship('WatchLater', backref='user', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'website': self.website,
            'location': self.location,
            'is_creator': self.is_creator,
            'has_password': self.password_hash is not None,
            'created_at': self.created_at.isoformat(),
        }
