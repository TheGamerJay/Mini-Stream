from flask import Blueprint, request, jsonify, Response
from .. import db, cache
from ..models.video import Video
from ..models.series import Series
from ..models.user import User

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
@cache.cached(timeout=90, key_prefix='home_data')
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

    movies = (
        Video.query.filter(
            Video.is_published == True,
            Video.video_type.in_(['Movie', 'Movie Adaptation']),
        )
        .order_by(Video.view_count.desc())
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
        'movies': [v.to_dict() for v in movies],
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
        # Use PostgreSQL full-text search when available, fall back to ilike
        try:
            from sqlalchemy import text as sql_text
            from .. import db
            fts_filter = sql_text(
                "to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')) "
                "@@ plainto_tsquery('english', :q)"
            )
            video_query = video_query.filter(fts_filter.bindparams(q=q))
            series_q2 = series_query.filter(Series.title.ilike(f'%{q}%'))
        except Exception:
            video_query = video_query.filter(Video.title.ilike(f'%{q}%'))
            series_q2 = series_query.filter(Series.title.ilike(f'%{q}%'))
        series_query = series_q2
        # Also search by creator name
        creator_match = (
            Video.query.join(User, User.id == Video.creator_id)
            .filter(Video.is_published == True, User.display_name.ilike(f'%{q}%'))
            .order_by(Video.view_count.desc())
            .limit(10)
            .all()
        )
    else:
        creator_match = []
    if genre:
        video_query = video_query.filter_by(genre=genre)
        series_query = series_query.filter_by(genre=genre)
    if language:
        video_query = video_query.filter_by(language=language)
        series_query = series_query.filter_by(language=language)

    videos = video_query.order_by(Video.view_count.desc()).limit(24).all()
    # Merge creator-match results (dedup by id)
    seen = {v.id for v in videos}
    for v in creator_match:
        if v.id not in seen:
            videos.append(v)
            seen.add(v.id)
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
    type_filter = request.args.get('type', '').strip()
    duration_filter = request.args.get('duration', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = 24

    video_query = Video.query.filter(Video.is_published == True)
    if q:
        video_query = video_query.outerjoin(User, User.id == Video.creator_id).filter(
            db.or_(Video.title.ilike(f'%{q}%'), User.display_name.ilike(f'%{q}%'))
        )
    if genre:
        video_query = video_query.filter(Video.genre == genre)
    if language:
        video_query = video_query.filter(Video.language == language)
    if rating:
        video_query = video_query.filter(Video.content_rating == rating)
    if type_filter == 'movie':
        video_query = video_query.filter(Video.video_type.in_(['Movie', 'Movie Adaptation']))
    elif type_filter == 'show':
        video_query = video_query.filter(Video.video_type == 'Episode')
    elif type_filter == 'standalone':
        video_query = video_query.filter(Video.video_type == 'Standalone')
    if duration_filter == 'short':
        video_query = video_query.filter(Video.duration < 1800)
    elif duration_filter == 'medium':
        video_query = video_query.filter(Video.duration >= 1800, Video.duration <= 5400)
    elif duration_filter == 'long':
        video_query = video_query.filter(Video.duration > 5400)

    paginated = video_query.order_by(Video.view_count.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        'videos': [v.to_dict() for v in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@discover_bp.route('/creator/<int:creator_id>', methods=['GET'])
def get_creator_profile(creator_id):
    user = User.query.get_or_404(creator_id)
    if not user.is_creator:
        return jsonify({'error': 'Not a creator'}), 404
    videos = (
        Video.query.filter_by(creator_id=creator_id, is_published=True)
        .order_by(Video.view_count.desc())
        .limit(50)
        .all()
    )
    total_views = sum(v.view_count for v in videos)
    creator_data = {
        'id': user.id,
        'display_name': user.display_name,
        'bio': user.bio,
        'avatar_url': user.avatar_url,
        'website': user.website,
        'location': user.location,
        'video_count': len(videos),
        'total_views': total_views,
    }
    return jsonify({'creator': creator_data, 'videos': [v.to_dict() for v in videos]})


@discover_bp.route('/autocomplete', methods=['GET'])
def autocomplete():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'suggestions': []})
    # Video titles
    videos = (
        Video.query.filter(Video.is_published == True, Video.title.ilike(f'%{q}%'))
        .order_by(Video.view_count.desc())
        .limit(5)
        .all()
    )
    # Creator names
    creators = (
        User.query.filter(User.is_creator == True, User.display_name.ilike(f'%{q}%'))
        .limit(3)
        .all()
    )
    suggestions = [{'type': 'video', 'id': v.id, 'label': v.title} for v in videos]
    suggestions += [{'type': 'creator', 'id': u.id, 'label': u.display_name} for u in creators]
    return jsonify({'suggestions': suggestions})


@discover_bp.route('/announcement', methods=['GET'])
def get_announcement():
    from ..models.announcement import Announcement
    ann = Announcement.query.filter_by(is_active=True).order_by(Announcement.created_at.desc()).first()
    return jsonify({'announcement': ann.to_dict() if ann else None})


@discover_bp.route('/creator/<int:creator_id>/rss', methods=['GET'])
def creator_rss(creator_id):
    user = User.query.get_or_404(creator_id)
    if not user.is_creator:
        return Response('Not a creator', status=404)
    videos = (
        Video.query.filter_by(creator_id=creator_id, is_published=True)
        .order_by(Video.created_at.desc())
        .limit(50)
        .all()
    )
    base = request.host_url.rstrip('/')
    items_xml = ''
    for v in videos:
        items_xml += f'''
    <item>
      <title><![CDATA[{v.title}]]></title>
      <link>{base}/watch/{v.id}</link>
      <description><![CDATA[{v.description or ''}]]></description>
      <pubDate>{v.created_at.strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>
      <guid>{base}/watch/{v.id}</guid>
      {'<enclosure url="' + v.video_url + '" type="video/mp4"/>' if v.video_url else ''}
    </item>'''
    rss = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[{user.display_name} on MiniStream]]></title>
    <link>{base}/creator/{creator_id}</link>
    <description><![CDATA[{user.bio or f'Videos by {user.display_name}'}]]></description>
    {items_xml}
  </channel>
</rss>'''
    return Response(rss, mimetype='application/rss+xml')


@discover_bp.route('/genres', methods=['GET'])
def genres():
    return jsonify({'genres': GENRES})


@discover_bp.route('/languages', methods=['GET'])
def languages():
    return jsonify({'languages': LANGUAGES})


@discover_bp.route('/ratings', methods=['GET'])
def ratings():
    return jsonify({'ratings': RATINGS})
