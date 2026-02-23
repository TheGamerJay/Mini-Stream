from flask import Blueprint, request, jsonify
from ..models.video import Video
from ..models.series import Series

discover_bp = Blueprint('discover', __name__)

GENRES = [
    'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
    'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
    'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen',
    'Experimental',
]
LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Japanese']
RATINGS = ['G', 'PG', 'PG-13', 'R', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'NR']


@discover_bp.route('/home', methods=['GET'])
def home():
    featured_series = (
        Series.query.filter_by(is_published=True)
        .order_by(Series.created_at.desc())
        .first()
    )

    trending = (
        Video.query.filter_by(is_published=True)
        .order_by(Video.view_count.desc())
        .limit(20)
        .all()
    )

    new_episodes = (
        Video.query.filter_by(is_published=True)
        .filter(Video.series_id.isnot(None))
        .order_by(Video.created_at.desc())
        .limit(20)
        .all()
    )

    recently_added = (
        Video.query.filter_by(is_published=True)
        .order_by(Video.created_at.desc())
        .limit(20)
        .all()
    )

    featured_series_list = (
        Series.query.filter_by(is_published=True)
        .order_by(Series.created_at.desc())
        .limit(20)
        .all()
    )

    genre_rows = {}
    for genre in GENRES:
        genre_videos = (
            Video.query.filter_by(is_published=True, genre=genre)
            .order_by(Video.view_count.desc())
            .limit(20)
            .all()
        )
        if genre_videos:
            genre_rows[genre] = [v.to_dict() for v in genre_videos]

    return jsonify({
        'featured': featured_series.to_dict() if featured_series else None,
        'trending': [v.to_dict() for v in trending],
        'new_episodes': [v.to_dict() for v in new_episodes],
        'recently_added': [v.to_dict() for v in recently_added],
        'featured_series': [s.to_dict() for s in featured_series_list],
        'genres': genre_rows,
    })


@discover_bp.route('/search', methods=['GET'])
def search():
    q = request.args.get('q', '').strip()
    genre = request.args.get('genre', '').strip()
    language = request.args.get('language', '').strip()

    if not q and not genre and not language:
        return jsonify({'error': 'Provide q, genre, or language'}), 400

    video_query = Video.query.filter_by(is_published=True)
    series_query = Series.query.filter_by(is_published=True)

    if q:
        video_query = video_query.filter(Video.title.ilike(f'%{q}%'))
        series_query = series_query.filter(Series.title.ilike(f'%{q}%'))
    if genre:
        video_query = video_query.filter_by(genre=genre)
        series_query = series_query.filter_by(genre=genre)
    if language:
        video_query = video_query.filter_by(language=language)
        series_query = series_query.filter_by(language=language)

    videos = video_query.order_by(Video.view_count.desc()).limit(24).all()
    series = series_query.order_by(Series.created_at.desc()).limit(12).all()

    return jsonify({
        'videos': [v.to_dict() for v in videos],
        'series': [s.to_dict() for s in series],
    })


@discover_bp.route('/browse', methods=['GET'])
def browse():
    genre = request.args.get('genre', '').strip()
    language = request.args.get('language', '').strip()
    rating = request.args.get('rating', '').strip()
    q = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = 24

    video_query = Video.query.filter_by(is_published=True)
    if q:
        video_query = video_query.filter(Video.title.ilike(f'%{q}%'))
    if genre:
        video_query = video_query.filter_by(genre=genre)
    if language:
        video_query = video_query.filter_by(language=language)
    if rating:
        video_query = video_query.filter_by(content_rating=rating)

    paginated = video_query.order_by(Video.view_count.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        'videos': [v.to_dict() for v in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@discover_bp.route('/genres', methods=['GET'])
def genres():
    return jsonify({'genres': GENRES})


@discover_bp.route('/languages', methods=['GET'])
def languages():
    return jsonify({'languages': LANGUAGES})


@discover_bp.route('/ratings', methods=['GET'])
def ratings():
    return jsonify({'ratings': RATINGS})
