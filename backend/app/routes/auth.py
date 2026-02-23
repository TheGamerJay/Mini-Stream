import os
import secrets
import logging
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)
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

    from_addr = os.environ.get('RESEND_FROM', 'MiniStream <noreply@ministream.com>')
    reply_to = os.environ.get('RESEND_REPLY_TO', 'ministream.help@gmail.com')
    base_url = os.environ.get('FRONTEND_URL', 'https://mini-stream-production.up.railway.app')
    try:
        resend.Emails.send({
            'from': from_addr,
            'reply_to': reply_to,
            'to': [email],
            'subject': 'Welcome to MiniStream!',
            'html': f'''
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#e5e5e5;border-radius:12px;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <img src="{base_url}/Mini%20Stream%20logo.png" alt="MiniStream" style="height:72px;width:auto;" />
                    </div>
                    <h2 style="color:#00d4ff;margin-bottom:8px;">Welcome, {display_name}!</h2>
                    <p style="color:#a0a0b0;">You&apos;re officially part of MiniStream — the home of original stories and indie creators.</p>
                    <p style="color:#a0a0b0;">Start exploring content from creators around the world, or apply to become a creator yourself and share your story.</p>
                    <p style="color:#606070;font-size:0.9em;">You&apos;re in control — no spam, no algorithms, no noise.</p>
                    <div style="text-align:center;margin:28px 0;">
                        <a href="{base_url}/home" style="display:inline-block;padding:12px 32px;background:#00d4ff;color:#000;border-radius:8px;text-decoration:none;font-weight:700;margin-right:12px;">Browse Content</a>
                        <a href="{base_url}/become-creator" style="display:inline-block;padding:12px 32px;background:transparent;color:#00d4ff;border:2px solid #00d4ff;border-radius:8px;text-decoration:none;font-weight:700;">Become a Creator</a>
                    </div>
                    <hr style="border:none;border-top:1px solid #1e1e2e;margin:24px 0;" />
                    <p style="color:#606070;font-size:12px;text-align:center;">MiniStream · Original stories. Indie creators. No noise.</p>
                </div>
            ''',
        })
    except Exception as e:
        logger.error('Welcome email failed for %s: %s', email, e)

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
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

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
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

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)  # keep as str
    return jsonify({'access_token': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/become-creator', methods=['POST'])
@jwt_required()
def become_creator():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_creator = True
    db.session.commit()

    from_addr = os.environ.get('RESEND_FROM', 'MiniStream <noreply@ministream.online>')
    base_url = os.environ.get('FRONTEND_URL', 'https://ministream.online')

    # Notify admin
    try:
        resend.Emails.send({
            'from': from_addr,
            'to': ['ministream.help@gmail.com'],
            'subject': f'New Creator: {user.display_name}',
            'html': f'''
                <div style="font-family:sans-serif;max-width:480px;padding:24px;background:#0a0a0f;color:#e5e5e5;border-radius:12px;">
                    <h2 style="color:#00d4ff;">New Creator Activated</h2>
                    <p><strong>{user.display_name}</strong> just activated their Creator account.</p>
                    <p>Email: {user.email}</p>
                    <p>User ID: {user.id}</p>
                </div>
            ''',
        })
    except Exception as e:
        logger.error('Creator admin alert failed: %s', e)

    # Welcome the new creator
    try:
        resend.Emails.send({
            'from': from_addr,
            'to': [user.email],
            'subject': "You're now a MiniStream Creator!",
            'html': f'''
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#e5e5e5;border-radius:12px;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <img src="{base_url}/Mini%20Stream%20logo.png" alt="MiniStream" style="height:72px;width:auto;" />
                    </div>
                    <h2 style="color:#00d4ff;margin-bottom:8px;">Creator account activated, {user.display_name}!</h2>
                    <p style="color:#a0a0b0;">Your MiniStream Creator account is live. You can now upload videos, create series, and share your original stories with the world.</p>
                    <div style="text-align:center;margin:28px 0;">
                        <a href="{base_url}/creator" style="display:inline-block;padding:12px 32px;background:#00d4ff;color:#000;border-radius:8px;text-decoration:none;font-weight:700;">Go to Creator Dashboard</a>
                    </div>
                    <hr style="border:none;border-top:1px solid #1e1e2e;margin:24px 0;" />
                    <p style="color:#606070;font-size:12px;text-align:center;">MiniStream · Original stories. Indie creators. No noise.</p>
                </div>
            ''',
        })
    except Exception as e:
        logger.error('Creator welcome email failed for %s: %s', user.email, e)

    return jsonify({'user': user.to_dict()})


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
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
                        <div style="text-align:center;margin-bottom:24px;">
                            <img src="{base_url}/Mini%20Stream%20logo.png" alt="MiniStream" style="height:72px;width:auto;" />
                        </div>
                        <h2 style="color:#00d4ff;margin-bottom:8px;">Reset your password</h2>
                        <p style="color:#a0a0b0;">You requested a password reset for your MiniStream account.</p>
                        <p style="color:#a0a0b0;">Click the button below to set a new password. This link expires in 1 hour.</p>
                        <a href="{reset_link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#00d4ff;color:#000;border-radius:8px;text-decoration:none;font-weight:700;">Reset Password</a>
                        <p style="color:#606070;font-size:13px;">If you didn&apos;t request this, you can safely ignore this email.</p>
                        <hr style="border:none;border-top:1px solid #1e1e2e;margin:24px 0;" />
                        <p style="color:#606070;font-size:12px;text-align:center;">MiniStream · Original stories. Indie creators. No noise.</p>
                    </div>
                ''',
            })
        except Exception as e:
            logger.error('Reset email failed for %s: %s', email, e)

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


@auth_bp.route('/contact', methods=['POST'])
def contact():
    data = request.get_json() or {}
    name = data.get('name', '').strip()[:100]
    email_from = data.get('email', '').strip()[:200]
    subject = data.get('subject', 'General Inquiry').strip()[:100]
    message = data.get('message', '').strip()[:2000]

    if not name or not email_from or not message:
        return jsonify({'error': 'Name, email, and message are required'}), 400

    from_addr = os.environ.get('RESEND_FROM', 'MiniStream <noreply@ministream.online>')
    try:
        resend.Emails.send({
            'from': from_addr,
            'reply_to': email_from,
            'to': ['ministream.help@gmail.com'],
            'subject': f'[Contact] {subject} — {name}',
            'html': f'''
                <div style="font-family:sans-serif;max-width:480px;padding:24px;background:#0a0a0f;color:#e5e5e5;border-radius:12px;">
                    <h2 style="color:#00d4ff;">New Contact Message</h2>
                    <p><strong>From:</strong> {name} &lt;{email_from}&gt;</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <hr style="border:none;border-top:1px solid #1e1e2e;margin:16px 0;" />
                    <p style="white-space:pre-wrap;color:#a0a0b0;">{message}</p>
                </div>
            ''',
        })
    except Exception as e:
        logger.error('Contact email failed: %s', e)
        return jsonify({'error': 'Failed to send message. Please try again.'}), 500

    return jsonify({'message': 'Message sent! We\'ll get back to you within 3–5 business days.'})
