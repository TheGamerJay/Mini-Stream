import os
from flask import Blueprint, request, jsonify
from functools import wraps
from .. import db, bcrypt
from ..models.user import User
from ..models.video import Video
from ..models.series import Series

admin_bp = Blueprint('admin', __name__)

ADMIN_EMAIL = 'ministream.help@gmail.com'
ADMIN_PASSWORD = 'Yariel@13'
ADMIN_TOKEN = 'ministream-admin-secret-2025'


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('X-Admin-Token')
        if token != ADMIN_TOKEN:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request'}), 400
    if data.get('email') == ADMIN_EMAIL and data.get('password') == ADMIN_PASSWORD:
        return jsonify({'token': ADMIN_TOKEN})
    return jsonify({'error': 'Invalid credentials'}), 401


@admin_bp.route('/stats', methods=['GET'])
@require_admin
def admin_stats():
    total_users = User.query.count()
    total_creators = User.query.filter_by(is_creator=True).count()
    total_videos = Video.query.count()
    total_published_videos = Video.query.filter_by(is_published=True).count()
    total_series = Series.query.count()
    total_views = db.session.query(db.func.sum(Video.view_count)).scalar() or 0
    recent_signups = (
        User.query.order_by(User.created_at.desc()).limit(5).all()
    )
    return jsonify({
        'total_users': total_users,
        'total_creators': total_creators,
        'total_videos': total_videos,
        'total_published_videos': total_published_videos,
        'total_series': total_series,
        'total_views': int(total_views),
        'recent_signups': [
            {
                'id': u.id,
                'email': u.email,
                'display_name': u.display_name,
                'is_creator': u.is_creator,
                'created_at': u.created_at.isoformat(),
            }
            for u in recent_signups
        ],
    })


@admin_bp.route('/users', methods=['GET'])
@require_admin
def admin_users():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    query = User.query
    if search:
        query = query.filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                User.display_name.ilike(f'%{search}%'),
            )
        )
    paginated = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        'users': [
            {
                'id': u.id,
                'email': u.email,
                'display_name': u.display_name,
                'is_creator': u.is_creator,
                'google_id': u.google_id,
                'created_at': u.created_at.isoformat(),
                'video_count': u.videos.count(),
            }
            for u in paginated.items
        ],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/videos', methods=['GET'])
@require_admin
def admin_videos():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    query = Video.query
    if search:
        query = query.filter(Video.title.ilike(f'%{search}%'))
    paginated = query.order_by(Video.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        'videos': [
            {
                'id': v.id,
                'title': v.title,
                'creator_name': v.creator.display_name if v.creator else None,
                'genre': v.genre,
                'video_type': v.video_type,
                'content_rating': v.content_rating,
                'view_count': v.view_count,
                'is_published': v.is_published,
                'duration': v.duration,
                'created_at': v.created_at.isoformat(),
            }
            for v in paginated.items
        ],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/series', methods=['GET'])
@require_admin
def admin_series():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '').strip()
    query = Series.query
    if search:
        query = query.filter(Series.title.ilike(f'%{search}%'))
    paginated = query.order_by(Series.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return jsonify({
        'series': [
            {
                'id': s.id,
                'title': s.title,
                'creator_name': s.creator.display_name if s.creator else None,
                'genre': s.genre,
                'content_rating': s.content_rating,
                'episode_count': s.episodes.count(),
                'is_published': s.is_published,
                'created_at': s.created_at.isoformat(),
            }
            for s in paginated.items
        ],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
def admin_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})


@admin_bp.route('/series/<int:series_id>', methods=['DELETE'])
@require_admin
def admin_delete_series(series_id):
    series = Series.query.get_or_404(series_id)
    for ep in list(series.episodes):
        db.session.delete(ep)
    db.session.delete(series)
    db.session.commit()
    return jsonify({'message': 'Series deleted'})


@admin_bp.route('/videos/<int:video_id>', methods=['DELETE'])
@require_admin
def admin_delete_video(video_id):
    video = Video.query.get_or_404(video_id)
    db.session.delete(video)
    db.session.commit()
    return jsonify({'message': 'Video deleted'})


# ── Demo seed / clear ─────────────────────────────────────────────────────────

_DEMO_EMAILS = [
    'demo_creator1@ministream.dev',
    'demo_creator2@ministream.dev',
    'demo_creator3@ministream.dev',
]

_DEMO_VIDS = [
    # Blender open short films (animated, royalty-free)
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    # Mixkit 3D/animation clips (royalty-free, no auth needed)
    'https://assets.mixkit.co/videos/31549/31549-720.mp4',   # flying into a black hole
    'https://assets.mixkit.co/videos/14540/14540-720.mp4',   # flying across rocky planet
    'https://assets.mixkit.co/videos/32941/32941-720.mp4',   # exploring flowery gardens
    'https://assets.mixkit.co/videos/34041/34041-720.mp4',   # man on mountain at sunset
    'https://assets.mixkit.co/videos/18052/18052-720.mp4',   # particle explosion / fire
    'https://assets.mixkit.co/videos/32953/32953-720.mp4',   # dark creepy graveyard
]

def _thumb(seed):
    return f'https://picsum.photos/seed/{seed}/480/270'

def _vurl(i):
    return _DEMO_VIDS[i % len(_DEMO_VIDS)]

_DEMO_SERIES = [
    {
        'ci': 0, 'title': 'Shadow Realm Chronicles', 'genre': 'Fantasy', 'language': 'English',
        'rating': 'TV-MA', 'thumb': _thumb('shadow_realm'),
        'desc': 'A dark fantasy epic following a cursed warrior navigating a world where shadows are alive.',
        'episodes': [
            ('The Cursed Blade', 'Kira discovers an ancient sword that bonds to her soul.', 1),
            ('City of Echoes', 'The journey begins through a city that whispers secrets.', 2),
            ('The Hollow King', 'A forgotten ruler awakens from centuries of slumber.', 3),
            ('Blood Pact', 'Kira must forge an alliance with her greatest enemy.', 4),
        ],
    },
    {
        'ci': 0, 'title': 'Cafe Soleil', 'genre': 'Slice of Life', 'language': 'English',
        'rating': 'TV-G', 'thumb': _thumb('cafe_soleil'),
        'desc': 'A warm series about the staff and regulars of a small seaside café.',
        'episodes': [
            ('Opening Day', 'The café opens its doors for the first time.', 1),
            ('The Regular', 'A mysterious customer orders the same thing every day.', 2),
            ('Rainy Season', 'A storm keeps the crew stuck inside together.', 3),
        ],
    },
    {
        'ci': 1, 'title': 'Neon Drift', 'genre': 'Action', 'language': 'English',
        'rating': 'TV-14', 'thumb': _thumb('neon_drift'),
        'desc': 'Underground street racers in a cyberpunk megacity fight for territory and survival.',
        'episodes': [
            ('Zero to Sixty', 'Ryo enters his first illegal street race.', 1),
            ('Burning Chrome', 'A rival crew torches the garage — payback is coming.', 2),
            ('Ghost Lane', "The city's most dangerous road opens at midnight.", 3),
            ('Final Circuit', 'Winner takes the entire city grid.', 4),
        ],
    },
    {
        'ci': 1, 'title': 'The Mechanical Garden', 'genre': 'Sci-Fi', 'language': 'English',
        'rating': 'TV-G', 'thumb': _thumb('mech_garden'),
        'desc': 'In a world run by clockwork automata, one girl befriends a broken-down robot gardener.',
        'episodes': [
            ('Rust and Petals', "Emilia finds Unit 7 half-buried in her grandmother's garden.", 1),
            ('Winding Up', 'Getting Unit 7 running again requires parts that are hard to find.', 2),
            ('Spring Protocol', "Unit 7 begins to develop routines that weren't in its code.", 3),
        ],
    },
    {
        'ci': 2, 'title': 'Phantom Signal', 'genre': 'Mystery', 'language': 'English',
        'rating': 'TV-PG', 'thumb': _thumb('phantom_signal'),
        'desc': 'A radio operator begins receiving transmissions from someone who died 30 years ago.',
        'episodes': [
            ('Dead Air', 'The first voice breaks through on a stormy night.', 1),
            ('Frequency', 'The messages grow longer and more specific.', 2),
            ('Static', 'Someone else is listening in.', 3),
            ('Last Transmission', 'The truth behind the signal surfaces.', 4),
        ],
    },
]

# Standalone entries: (creator_index, title, genre, description, rating, video_url_or_None)
# video_url_or_None = None  →  uses rotating _vurl(i) placeholder
# video_url_or_None = URL   →  uses that specific video (real public-domain anime from archive.org)
_STANDALONE = [
    (0, 'The Watcher (Short Film)', 'Horror', 'A lone security guard discovers something is watching him through the cameras.', 'TV-MA', None),
    (0, 'Bloom — An Animated Short', 'Experimental', 'A wordless meditation on growth, loss, and returning home.', 'TV-G', None),
    (1, 'Midnight Ramen', 'Slice of Life', 'A chef finds unexpected company in his empty restaurant at 2AM.', 'TV-G', None),
    (1, 'Steel and Sky', 'Action', 'A ronin takes a final job that forces her to face her past.', 'TV-14', None),
    (2, 'Orbit', 'Sci-Fi', 'Two astronauts stranded in orbit must decide who comes home.', 'TV-PG', None),
    (2, 'The Last Library', 'Drama', 'A librarian refuses to leave the last standing building in a demolished city.', 'TV-PG', None),
    (0, 'Ghost Town Blues', 'Mystery', 'A detective wakes up in a town with no one left — but someone is still leaving notes.', 'TV-PG', None),
    (1, 'Paper Cranes', 'Romance', 'Two strangers exchange messages folded into origami cranes left at the same park bench.', 'TV-G', None),
    # Real public-domain anime from Internet Archive
    (0, 'Speed Racer — The Great Plan Pt. 1', 'Anime',
     'Mach 5 driver Go Mifune competes in the most dangerous race of his life. Classic 1967 anime.',
     'TV-G',
     'https://archive.org/download/speed-racer-episode-03/Speed%20Racer%20Episode%2001.mp4'),
    (1, 'Gigantor — The Plot to Steal the Sun', 'Isekai',
     'A boy and his giant robot are humanity\'s last defence against a power-hungry villain. 1993 anime.',
     'TV-G',
     'https://archive.org/download/the-new-adventures-of-gigantor/The%20New%20Adventures%20of%20Gigantor%2001%20-%20The%20Plot%20to%20Steal%20the%20Sun.mp4'),
    (2, 'Cyborg 009 — Episode 1', 'Seinen',
     'Nine ordinary people are kidnapped and turned into cyborg soldiers. Ishinomori\'s dark 1968 action anime.',
     'TV-14',
     'https://archive.org/download/cyborg-009-1968/%5BBunny_Hat_Raw%5DCyborg_009_%281968%29_01_%28BB69BBAA%29.mp4'),
    (0, 'Jungle Emperor — Episode 1', 'Shojo',
     'Kimba the white lion cub journeys from Africa to Japan in search of his destiny. Tezuka\'s classic 1965 anime.',
     'TV-G',
     'https://archive.org/download/jungletaitei/Jungle%20Taitei%20(1965)%20-%2001%20%5B1080p%5D.mp4',
     'Japanese'),
    (1, 'Speed Racer — The New Adventures Ep. 1', 'Shonen',
     'Go Mifune returns in an all-new high-speed adventure. 1993 revival series.',
     'TV-G',
     'https://archive.org/download/new-adventures-of-speed-racer/The%20New%20Adventures%20of%20Speed%20Racer%20E01%20-%20The%20Mach-5s%20First%20Trial.mp4'),
    (2, 'Red Mist', 'Horror', 'A mountain hiking trip goes wrong when the fog rolls in with something inside it.', 'TV-MA', None),
    (0, 'Voltage', 'Action', 'An underground boxer discovers she can channel electricity — and someone wants to weaponize it.', 'TV-14', None),
    (1, 'The Cartographer', 'Adventure', 'A mapmaker is hired to chart a territory that no map has ever shown accurately.', 'TV-PG', None),
    (2, 'Soft Shutdown', 'Psychological', 'A therapist realizes her newest patient may not be entirely human.', 'TV-14', None),
]


@admin_bp.route('/seed-demo', methods=['POST'])
@require_admin
def seed_demo():
    existing = User.query.filter(User.email.in_(_DEMO_EMAILS)).first()
    if existing:
        return jsonify({'message': 'Demo data already seeded.'}), 200

    pw = bcrypt.generate_password_hash('demo1234').decode('utf-8')
    creators = []
    for name, email in [('Aiko Studios', _DEMO_EMAILS[0]),
                        ('NightOwl Animation', _DEMO_EMAILS[1]),
                        ('PixelDrift Films', _DEMO_EMAILS[2])]:
        u = User(email=email, display_name=name, password_hash=pw, is_creator=True)
        db.session.add(u)
        db.session.flush()
        creators.append(u)

    vi = 0
    for s_data in _DEMO_SERIES:
        c = creators[s_data['ci']]
        s = Series(
            creator_id=c.id, title=s_data['title'], description=s_data['desc'],
            genre=s_data['genre'], language=s_data['language'],
            content_rating=s_data['rating'], thumbnail_url=s_data['thumb'], is_published=True,
        )
        db.session.add(s)
        db.session.flush()
        for ep_title, ep_desc, ep_num in s_data['episodes']:
            db.session.add(Video(
                creator_id=c.id, series_id=s.id, title=ep_title, description=ep_desc,
                genre=s_data['genre'], language=s_data['language'], video_type='Episode',
                content_rating=s_data['rating'], video_url=_vurl(vi),
                thumbnail_url=_thumb(f"ep{ep_num}_{s.id}"),
                episode_number=ep_num, season_number=1,
                duration=420 + ep_num * 180,
                view_count=max(10, 600 - ep_num * 50 + vi * 11),
                is_published=True,
            ))
            vi += 1

    for i, entry in enumerate(_STANDALONE):
        ci, title, genre, desc, rating, specific_url = entry[:6]
        lang = entry[6] if len(entry) > 6 else 'English'
        c = creators[ci]
        db.session.add(Video(
            creator_id=c.id, title=title, description=desc,
            genre=genre, language=lang, video_type='Standalone',
            content_rating=rating, video_url=specific_url or _vurl(vi),
            thumbnail_url=_thumb(f"solo{i}"),
            duration=600 + i * 120, view_count=80 + i * 53,
            is_published=True,
        ))
        vi += 1

    db.session.commit()
    return jsonify({'message': f'Seeded 3 creators, {len(_DEMO_SERIES)} series, {vi} videos.'})


@admin_bp.route('/seed-demo', methods=['DELETE'])
@require_admin
def clear_demo():
    users = User.query.filter(User.email.in_(_DEMO_EMAILS)).all()
    if not users:
        return jsonify({'message': 'No demo data found.'}), 200
    for u in users:
        for v in list(u.videos):
            db.session.delete(v)
        for s in list(u.series):
            for ep in list(s.episodes):
                db.session.delete(ep)
            db.session.delete(s)
        db.session.delete(u)
    db.session.commit()
    return jsonify({'message': 'Demo data cleared.'})
