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
    type_filter = request.args.get('type', '').strip()
    query = Video.query
    if search:
        query = query.filter(Video.title.ilike(f'%{search}%'))
    if type_filter == 'movie':
        query = query.filter(Video.video_type.in_(['Movie', 'Movie Adaptation']))
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
    # Blender Open Movies (CC BY) — used as rotating episode placeholder videos
    'https://archive.org/download/BigBuckBunnyFULLHD60FPS/Big%20Buck%20Bunny%20-%20FULL%20HD%2060FPS.mp4',
    'https://archive.org/download/ElephantsDream/ed_hd.mp4',
    'https://archive.org/download/Sintel/sintel-2048-stereo.mp4',
    'https://archive.org/download/Tears-of-Steel/tears_of_steel_1080p.mp4',
    'https://archive.org/download/CosmosLaundromatFirstCycle/Cosmos%20Laundromat%20-%20First%20Cycle%20%281080p%29.mp4',
    'https://archive.org/download/Caminandes2GranDillama/02_gran_dillama_1080p.mp4',
    'https://archive.org/download/coffee_202209/coffee.mp4',
    'https://archive.org/download/sprite-fright/Sprite%20Fright%20-%20Open%20Movie%20by%20Blender%20Studio-804p.mp4',
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


# Blender Open Movies + historic anime feature — seeded as video_type='Movie'
# (ci, title, genre, description, rating, url, language, duration_seconds)
_MOVIES = [
    (0, 'Big Buck Bunny', 'Animation',
     'A large, lovable rabbit lives peacefully in a meadow until three bullying rodents try to ruin his day. Blender Foundation open movie. (CC BY 3.0)',
     'TV-G', 'https://archive.org/download/BigBuckBunnyFULLHD60FPS/Big%20Buck%20Bunny%20-%20FULL%20HD%2060FPS.mp4', 'English', 596),
    (1, 'Elephants Dream', 'Experimental',
     "The first Blender open movie — a surreal, dreamlike journey through a mechanical world experienced by two strangers. (CC BY 3.0)",
     'TV-G', 'https://archive.org/download/ElephantsDream/ed_hd.mp4', 'English', 654),
    (2, 'Sintel', 'Fantasy',
     "A young woman crosses a dangerous world searching for her lost dragon companion. Blender Foundation's third open movie. (CC BY 3.0)",
     'TV-PG', 'https://archive.org/download/Sintel/sintel-2048-stereo.mp4', 'English', 888),
    (0, 'Tears of Steel', 'Sci-Fi',
     "Blender's first live-action/CGI hybrid open movie. Warriors and machines clash in a crumbling future city. (CC BY 3.0)",
     'TV-14', 'https://archive.org/download/Tears-of-Steel/tears_of_steel_1080p.mp4', 'English', 734),
    (1, 'Cosmos Laundromat: First Cycle', 'Fantasy',
     'A sheep on the verge of ending it all meets a mysterious stranger who offers him something remarkable. Blender Foundation open movie. (CC BY 4.0)',
     'TV-PG', 'https://archive.org/download/CosmosLaundromatFirstCycle/Cosmos%20Laundromat%20-%20First%20Cycle%20%281080p%29.mp4', 'English', 720),
    (2, 'Caminandes: Gran Dillama', 'Animation',
     'Koro the llama faces off against a stubborn cactus in a hilarious Patagonian wilderness short. Blender open movie. (CC BY 3.0)',
     'TV-G', 'https://archive.org/download/Caminandes2GranDillama/02_gran_dillama_1080p.mp4', 'English', 150),
    (0, 'Coffee Run', 'Drama',
     'A woman sprints through a rainy city in a desperate race against time — all for a cup of coffee. Blender Studio short film. (CC BY 4.0)',
     'TV-G', 'https://archive.org/download/coffee_202209/coffee.mp4', 'English', 185),
    (1, 'Sprite Fright', 'Horror',
     'A group of city friends trespassing in an enchanted forest get far more than they bargained for. Blender Studio open movie. (CC BY 4.0)',
     'TV-14', 'https://archive.org/download/sprite-fright/Sprite%20Fright%20-%20Open%20Movie%20by%20Blender%20Studio-804p.mp4', 'English', 480),
    (2, 'Momotaro: Sacred Sailors', 'Anime',
     "Japan's first feature-length anime film (1945). Commander Momotaro leads animal soldiers on a mission across the Pacific. A landmark of animation history. (Public Domain)",
     'TV-PG', 'https://archive.org/download/momotaro-umi-no-shinpei-1945/Momotar%C3%B4%20Umi%20no%20shinpei%20%281945%29.mp4', 'Japanese', 4440),
    # Public domain classics — NR (pre-rating-system era)
    (0, 'A Trip to the Moon', 'Experimental',
     "Georges Méliès' landmark 1902 fantasy — one of cinema's first narrative films. Astronomers build a rocket and travel to the moon in this groundbreaking 14-minute silent short. (Public Domain)",
     'NR', 'https://archive.org/download/ATripToTheMoon20Fps/TripToTheMoon20Fps.mp4', 'French', 840),
    (1, 'Nosferatu', 'Horror',
     'F.W. Murnau\'s 1922 unauthorized Dracula adaptation featuring the terrifying Count Orlok. A defining work of German Expressionist cinema. (Public Domain)',
     'NR', 'https://archive.org/download/Nosferatu1922HD/Nosferatu%20%281922%29%20HD.mp4', 'German', 5640),
    (2, 'The Cabinet of Dr. Caligari', 'Horror',
     "Robert Wiene's 1920 German Expressionist masterpiece — a hypnotist uses a somnambulist to commit murders. Its twisted, painted set design influenced horror filmmaking for a century. (Public Domain)",
     'NR', 'https://archive.org/download/the-cabinet-of-dr-caligari-1920/The%20Cabinet%20of%20Dr%20Caligari%20%281920%29.mp4', 'German', 4620),
    (0, 'The General', 'Action',
     "Buster Keaton's 1926 Civil War comedy epic. A train engineer races to rescue his locomotive and his girl from Union soldiers. Widely considered one of the greatest films ever made. (Public Domain)",
     'NR', 'https://archive.org/download/The_General_Buster_Keaton/The_General_512kb.mp4', 'English', 4740),
    (1, 'Sherlock Jr.', 'Mystery',
     'Buster Keaton stars as a film projectionist who dreams himself into the movie on screen to solve a robbery. A 1924 technical marvel full of mind-bending visual gags. (Public Domain)',
     'NR', 'https://archive.org/download/sherlock-jr-1924-restored-720p-hd/sherlock%20jr-1924-restored-720p-hd.mp4', 'English', 2700),
    (2, 'Metropolis', 'Sci-Fi',
     "Fritz Lang's 1927 landmark dystopian epic set in a futuristic city divided between the privileged elite above and exploited workers below. Features cinema's first iconic robot. (Public Domain)",
     'NR', 'https://archive.org/download/Metropolis1927EnglishVersion/Metropolis_1927_English_Version.mp4', 'English', 9180),
    (0, 'Night of the Living Dead', 'Horror',
     "George Romero's 1968 groundbreaking zombie film. Strangers barricade themselves in a farmhouse as the dead rise. The film that invented the modern zombie genre. (Public Domain)",
     'NR', 'https://archive.org/download/NightOfTheLivingDeadHD/NightOfTheLivingDeadRemasteredHD.mp4', 'English', 5760),
    (1, 'Carnival of Souls', 'Horror',
     'A 1962 cult horror classic. A woman who survives a car crash becomes haunted by eerie visions and a pale phantom who follows her everywhere. Shot on a shoestring budget. (Public Domain)',
     'NR', 'https://archive.org/download/CarnivalOfSouls720p1962/CarnivalOfSouls720p.mp4', 'English', 5040),
    (2, 'The Last Man on Earth', 'Sci-Fi',
     "Vincent Price stars in this 1964 adaptation of Richard Matheson's I Am Legend — the sole survivor of a plague that turns humanity into vampire-like creatures. (Public Domain)",
     'NR', 'https://archive.org/download/TheLastManOnEarthHD/The%20Last%20Man%20on%20Earth%20HD.mp4', 'English', 5160),
    (0, 'Plan 9 from Outer Space', 'Sci-Fi',
     "Ed Wood's infamously low-budget 1957 sci-fi cult classic. Aliens resurrect Earth's dead to stop humanity from developing a doomsday weapon. Celebrated worldwide as a beloved disaster. (Public Domain)",
     'NR', 'https://archive.org/download/plan-9-from-outer-space_202009/Plan%209%20from%20Outer%20Space.mp4', 'English', 4740),
    (1, 'Reefer Madness', 'Drama',
     "A hilariously over-the-top 1936 anti-marijuana propaganda film that became a beloved cult classic. A high school teacher warns parents about the 'dangers' of cannabis with wild melodrama. (Public Domain)",
     'NR', 'https://archive.org/download/reefermadness_202207/Reefer%20Madness%20%281936%29%20HD.mp4', 'English', 4020),
    # Classic Comedy — Public Domain
    (2, 'The Tramp', 'Comedy',
     "Charlie Chaplin's beloved 1915 short in which the Little Tramp falls for a farmgirl and has a change of heart after helping her family. One of Chaplin's most iconic early performances. (Public Domain)",
     'NR', 'https://archive.org/download/TheTramp1915/The-Tramp%20%281915%29.mp4', 'English', 1560),
    (0, 'Easy Street', 'Comedy',
     "Charlie Chaplin's 1917 masterpiece. The Little Tramp becomes a police officer and must clean up the most dangerous street in the city. Brilliant physical comedy at its peak. (Public Domain)",
     'NR', 'https://archive.org/download/EasyStreet1917_201708/Easy%20Street%20%281917%29.mp4', 'English', 1200),
    (1, 'The Immigrant', 'Comedy',
     "Chaplin's 1917 compassionate comedy follows the Little Tramp and a young woman as they arrive in America full of hope and face the harsh realities of immigrant life. (Public Domain)",
     'NR', 'https://archive.org/download/CharlieChaplinTheImmigrant1917HD_201808/Charlie%20Chaplin-The%20Immigrant%20%281917%29%20HD.mp4', 'English', 1500),
    (2, 'Sunnyside', 'Comedy',
     "Charlie Chaplin's 1919 pastoral comedy. The overworked handyman of a small village daydreams of romance and a better life in this charming early Chaplin short. (Public Domain)",
     'NR', 'https://archive.org/download/Sunnyside/Sunnyside.mp4', 'English', 1680),
    (0, 'The Kid', 'Comedy',
     "Charlie Chaplin's first feature film (1921). The Little Tramp finds and raises an abandoned baby boy, forming an unbreakable bond. One of cinema's most beloved comedies. (Public Domain)",
     'NR', 'https://archive.org/download/the-kid-1921_202411/The%20Kid%20%281921%29/The%20Kid%20%281921%29.mp4', 'English', 4080),
    (1, 'High and Dizzy', 'Comedy',
     "Harold Lloyd's 1920 silent comedy. A clumsy doctor accidentally gets drunk, then must navigate a hotel ledge high above the city streets in spectacular fashion. (Public Domain)",
     'NR', 'https://archive.org/download/high-dizzy.-1920/High%26Dizzy.1920.mp4', 'English', 1200),
    (2, 'Safety Last!', 'Comedy',
     "Harold Lloyd's 1923 classic. A small-town boy moves to the city and, to impress his girl, agrees to scale a 12-story building — including its giant clock face. An iconic image of silent cinema. (Public Domain)",
     'NR', 'https://archive.org/download/SafetyLastHaroldLloyd1923.FullMovieexcellentQuality./Safety%20Last%20-%20Harold%20Lloyd%201923.%20Full%20movie%2Cexcellent%20quality..mp4', 'English', 4200),
    (0, "Leave 'Em Laughing", 'Comedy',
     "Laurel and Hardy's 1928 short. After a disastrous trip to the dentist leaves them both laughing uncontrollably from gas, the duo causes chaos in city traffic. (Public Domain)",
     'NR', 'https://archive.org/download/laurel-and-hardy-leave-em-laughing-silent/Laurel%20and%20Hardy%20-%20Leave%20%27em%20Laughing%20%28Silent%29.mp4', 'English', 1380),
    (1, 'Should Married Men Go Home?', 'Comedy',
     "Laurel and Hardy's 1928 gem. Stan and Ollie drag a husband away from his wife for a golf outing that spirals into pure slapstick disaster. (Public Domain)",
     'NR', 'https://archive.org/download/laurel-hardy-should-married-men-go-home_202401/Laurel%20%26%20Hardy%20-%20Should%20Married%20Men%20Go%20Home%20.mp4', 'English', 1320),
    (2, 'Steamboat Bill, Jr.', 'Comedy',
     "Buster Keaton's 1928 masterpiece. A college-educated son returns to help his riverboat captain father, leading to the most spectacular cyclone sequence in silent film history. (Public Domain)",
     'NR', 'https://archive.org/download/SteamboatBillJr/Steamboat_Bill.Jr_512kb.mp4', 'English', 4140),
    (0, 'Our Hospitality', 'Comedy',
     "Buster Keaton's 1923 period comedy. A New Yorker travels south to claim an inheritance and falls for the daughter of the family sworn to kill him, all while riding an early locomotive. (CC0 Public Domain)",
     'NR', 'https://archive.org/download/OurHospitality_29/OurHospitality_512kb.mp4', 'English', 4380),
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

    for i, (ci, title, genre, desc, rating, url, lang, dur) in enumerate(_MOVIES):
        c = creators[ci]
        db.session.add(Video(
            creator_id=c.id, title=title, description=desc,
            genre=genre, language=lang, video_type='Movie',
            content_rating=rating, video_url=url,
            thumbnail_url=_thumb(f"movie{i}"),
            duration=dur, view_count=300 + i * 97,
            is_published=True,
        ))

    db.session.commit()
    return jsonify({'message': f'Seeded 3 creators, {len(_DEMO_SERIES)} series, {vi} videos, {len(_MOVIES)} movies.'})


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
