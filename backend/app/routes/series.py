from flask import Blueprint, request, jsonify
from ..models.series import Series

series_bp = Blueprint('series', __name__)


@series_bp.route('/', methods=['GET'])
def list_series():
    genre = request.args.get('genre')
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)

    query = Series.query.filter_by(is_published=True)
    if genre:
        query = query.filter_by(genre=genre)

    paginated = query.order_by(Series.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        'series': [s.to_dict() for s in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': paginated.page,
    })


@series_bp.route('/<int:series_id>', methods=['GET'])
def get_series(series_id):
    series = Series.query.get_or_404(series_id)
    if not series.is_published:
        return jsonify({'error': 'Series not found'}), 404
    return jsonify({'series': series.to_dict(include_episodes=True)})
