from datetime import datetime
from .. import db


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = db.relationship('User', foreign_keys=[user_id], backref=db.backref('comments', lazy='dynamic'))
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')

    def to_dict(self, include_replies=False):
        d = {
            'id': self.id,
            'video_id': self.video_id,
            'user_id': self.user_id,
            'user_name': self.author.display_name if self.author else 'Unknown',
            'user_avatar': self.author.avatar_url if self.author else None,
            'parent_id': self.parent_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
        }
        if include_replies:
            d['replies'] = [r.to_dict() for r in self.replies.order_by(Comment.created_at).all()]
        return d
