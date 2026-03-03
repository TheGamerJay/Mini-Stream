from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.donation import Donation
from ..models.user import User
from ..models.notification import Notification

donations_bp = Blueprint('donations', __name__)

AMOUNTS = [1, 3, 5, 10, 20, 50]


@donations_bp.route('/<int:creator_id>/donate', methods=['POST'])
@jwt_required()
def donate(creator_id):
    user_id = int(get_jwt_identity())
    creator = User.query.get_or_404(creator_id)
    if not creator.is_creator:
        return jsonify({'error': 'Not a creator'}), 400
    if user_id == creator_id:
        return jsonify({'error': 'Cannot donate to yourself'}), 400

    data = request.get_json() or {}
    amount = float(data.get('amount', 0))
    if amount not in AMOUNTS:
        return jsonify({'error': f'Amount must be one of {AMOUNTS}'}), 400

    message = (data.get('message') or '').strip()[:500]
    donation = Donation(donor_id=user_id, creator_id=creator_id, amount=amount, message=message)
    db.session.add(donation)

    # Notify creator
    donor = User.query.get(user_id)
    notif = Notification(
        user_id=creator_id,
        type='donation',
        message=f'{donor.display_name} donated ${amount:.2f}' + (f': "{message}"' if message else ''),
        link=f'/creator/{user_id}',
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify({'message': 'Thank you for your support!', 'donation': donation.to_dict()}), 201


@donations_bp.route('/<int:creator_id>/donations', methods=['GET'])
@jwt_required()
def get_creator_donations(creator_id):
    user_id = int(get_jwt_identity())
    # Only the creator can see their donations
    if user_id != creator_id:
        return jsonify({'error': 'Forbidden'}), 403
    page = request.args.get('page', 1, type=int)
    donations = (
        Donation.query.filter_by(creator_id=creator_id)
        .order_by(Donation.created_at.desc())
        .paginate(page=page, per_page=20, error_out=False)
    )
    total_earned = db.session.query(
        db.func.sum(Donation.amount)
    ).filter_by(creator_id=creator_id).scalar() or 0

    return jsonify({
        'donations': [d.to_dict() for d in donations.items],
        'total_earned': float(total_earned),
        'page': page,
        'pages': donations.pages,
    })
