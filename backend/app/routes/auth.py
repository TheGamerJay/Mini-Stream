import os
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
import requests as http_requests
import resend
from .. import db, bcrypt
from ..models.user import User

resend.api_key = os.environ.get('RESEND_API_KEY', '')

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    display_name = data.get('display_name', '').strip()

    if not email or not password or not display_name:
        return jsonify({'error': 'Email, password, and display name are required'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password_hash=password_hash, display_name=display_name)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash:
        return jsonify({'error': 'Invalid credentials'}), 401
    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    })


@auth_bp.route('/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    token = data.get('token') if data else None
    if not token:
        return jsonify({'error': 'Google token required'}), 400

    resp = http_requests.get(
        f'https://oauth2.googleapis.com/tokeninfo?id_token={token}', timeout=10
    )
    if resp.status_code != 200:
        return jsonify({'error': 'Invalid Google token'}), 401

    google_data = resp.json()
    google_id = google_data.get('sub')
    email = google_data.get('email', '').lower()

    if not google_id or not email:
        return jsonify({'error': 'Invalid Google token data'}), 401

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
        else:
            user = User(
                email=email,
                display_name=google_data.get('name', email.split('@')[0]),
                avatar_url=google_data.get('picture'),
                google_id=google_id,
            )
            db.session.add(user)
        db.session.commit()

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/become-creator', methods=['POST'])
@jwt_required()
def become_creator():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_creator = True
    db.session.commit()
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if data.get('display_name'):
        user.display_name = data['display_name'].strip()
    if data.get('bio') is not None:
        user.bio = data['bio']

    db.session.commit()
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = (data.get('email', '') if data else '').strip().lower()
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    # Always return success to avoid leaking whether email exists
    if user and user.password_hash:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        base_url = os.environ.get('FRONTEND_URL', 'https://mini-stream-production.up.railway.app')
        reset_link = f'{base_url}/reset-password?token={token}'
        from_addr = os.environ.get('RESEND_FROM', 'MiniStream <noreply@ministream.com>')
        reply_to = os.environ.get('RESEND_REPLY_TO', 'ministream.help@gmail.com')

        try:
            resend.Emails.send({
                'from': from_addr,
                'reply_to': reply_to,
                'to': [email],
                'subject': 'Reset your MiniStream password',
                'html': f'''
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#e5e5e5;border-radius:12px;">
                        <h2 style="color:#00d4ff;margin-bottom:8px;">Reset your password</h2>
                        <p style="color:#a0a0b0;">You requested a password reset for your MiniStream account.</p>
                        <p style="color:#a0a0b0;">Click the button below to set a new password. This link expires in 1 hour.</p>
                        <a href="{reset_link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#00d4ff;color:#000;border-radius:8px;text-decoration:none;font-weight:700;">Reset Password</a>
                        <p style="color:#606070;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border:none;border-top:1px solid #1e1e2e;margin:24px 0;" />
                        <p style="color:#606070;font-size:12px;">MiniStream · Original stories. Indie creators. No noise.</p>
                    </div>
                ''',
            })
        except Exception:
            pass

    return jsonify({'message': 'If that email is registered, a reset link has been sent.'})


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = (data.get('token', '') if data else '').strip()
    new_password = (data.get('password', '') if data else '')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired reset link'}), 400

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'})
