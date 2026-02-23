"""
Demo seed script — adds ~40 placeholder videos across genres and series.
Run from the backend/ directory:
    python seed_demo.py

To REMOVE all demo data later:
    python seed_demo.py --clear
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('FLASK_ENV', 'default')

from app import create_app, db, bcrypt
from app.models.user import User
from app.models.series import Series
from app.models.video import Video

# ── Public-domain sample videos (Google CDN) ──────────────────────────────────
VIDEOS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
]

def thumb(seed):
    return f'https://picsum.photos/seed/{seed}/480/270'

def vurl(i):
    return VIDEOS[i % len(VIDEOS)]


DEMO_CREATORS = [
    {'email': 'demo_creator1@ministream.dev', 'name': 'Aiko Studios', 'pw': 'demo1234'},
    {'email': 'demo_creator2@ministream.dev', 'name': 'NightOwl Animation', 'pw': 'demo1234'},
    {'email': 'demo_creator3@ministream.dev', 'name': 'PixelDrift Films', 'pw': 'demo1234'},
]

DEMO_SERIES = [
    {
        'creator_idx': 0,
        'title': 'Shadow Realm Chronicles',
        'description': 'A dark fantasy epic following a cursed warrior navigating a world where shadows are alive.',
        'genre': 'Fantasy',
        'language': 'English',
        'content_rating': 'Mature',
        'thumbnail': thumb('shadow_realm'),
        'episodes': [
            {'title': 'The Cursed Blade', 'desc': 'Kira discovers an ancient sword that bonds to her soul.', 'ep': 1},
            {'title': 'City of Echoes', 'desc': 'The journey begins through a city that whispers secrets.', 'ep': 2},
            {'title': 'The Hollow King', 'desc': 'A forgotten ruler awakens from centuries of slumber.', 'ep': 3},
            {'title': 'Blood Pact', 'desc': 'Kira must forge an alliance with her greatest enemy.', 'ep': 4},
        ],
    },
    {
        'creator_idx': 0,
        'title': 'Cafe Soleil',
        'description': 'A warm slice-of-life series about the staff and regulars of a small seaside café.',
        'genre': 'Slice of Life',
        'language': 'English',
        'content_rating': 'General',
        'thumbnail': thumb('cafe_soleil'),
        'episodes': [
            {'title': 'Opening Day', 'desc': 'The café opens its doors for the first time.', 'ep': 1},
            {'title': 'The Regular', 'desc': 'A mysterious customer orders the same thing every day.', 'ep': 2},
            {'title': 'Rainy Season', 'desc': 'A storm keeps the crew stuck inside together.', 'ep': 3},
        ],
    },
    {
        'creator_idx': 1,
        'title': 'Neon Drift',
        'description': 'Underground street racers in a cyberpunk megacity fight for territory and survival.',
        'genre': 'Action',
        'language': 'English',
        'content_rating': 'Mature',
        'thumbnail': thumb('neon_drift'),
        'episodes': [
            {'title': 'Zero to Sixty', 'desc': 'Ryo enters his first illegal street race.', 'ep': 1},
            {'title': 'Burning Chrome', 'desc': 'A rival crew torches the garage — payback is coming.', 'ep': 2},
            {'title': 'Ghost Lane', 'desc': 'The city\'s most dangerous road opens at midnight.', 'ep': 3},
            {'title': 'Final Circuit', 'desc': 'Winner takes the entire city grid.', 'ep': 4},
        ],
    },
    {
        'creator_idx': 1,
        'title': 'The Mechanical Garden',
        'description': 'In a world run by clockwork automata, one girl befriends a broken-down robot gardener.',
        'genre': 'Sci-Fi',
        'language': 'English',
        'content_rating': 'General',
        'thumbnail': thumb('mech_garden'),
        'episodes': [
            {'title': 'Rust and Petals', 'desc': 'Emilia finds Unit 7 half-buried in her grandmother\'s garden.', 'ep': 1},
            {'title': 'Winding Up', 'desc': 'Getting Unit 7 running again requires parts that are hard to find.', 'ep': 2},
            {'title': 'Spring Protocol', 'desc': 'Unit 7 begins to develop routines that weren\'t in its code.', 'ep': 3},
        ],
    },
    {
        'creator_idx': 2,
        'title': 'Phantom Signal',
        'description': 'A radio operator begins receiving transmissions from someone who died 30 years ago.',
        'genre': 'Mystery',
        'language': 'English',
        'content_rating': 'General',
        'thumbnail': thumb('phantom_signal'),
        'episodes': [
            {'title': 'Dead Air', 'desc': 'The first voice breaks through on a stormy night.', 'ep': 1},
            {'title': 'Frequency', 'desc': 'The messages grow longer and more specific.', 'ep': 2},
            {'title': 'Static', 'desc': 'Someone else is listening in.', 'ep': 3},
            {'title': 'Last Transmission', 'desc': 'The truth behind the signal surfaces.', 'ep': 4},
        ],
    },
]

STANDALONE_VIDEOS = [
    {'creator_idx': 0, 'title': 'The Watcher (Short Film)', 'genre': 'Horror', 'desc': 'A lone security guard discovers something is watching him back through the cameras.', 'rating': 'Mature'},
    {'creator_idx': 0, 'title': 'Bloom — An Animated Short', 'genre': 'Experimental', 'desc': 'A wordless meditation on growth, loss, and returning home.', 'rating': 'General'},
    {'creator_idx': 1, 'title': 'Midnight Ramen', 'genre': 'Slice of Life', 'desc': 'A chef finds unexpected company in his empty restaurant at 2AM.', 'rating': 'General'},
    {'creator_idx': 1, 'title': 'Steel and Sky', 'genre': 'Action', 'desc': 'A ronin takes a final job that forces her to face her past.', 'rating': 'Mature'},
    {'creator_idx': 2, 'title': 'Orbit', 'genre': 'Sci-Fi', 'desc': 'Two astronauts stranded in orbit must decide who comes home.', 'rating': 'General'},
    {'creator_idx': 2, 'title': 'The Last Library', 'genre': 'Drama', 'desc': 'A librarian refuses to leave the last standing building in a demolished city.', 'rating': 'General'},
    {'creator_idx': 0, 'title': 'Ghost Town Blues', 'genre': 'Mystery', 'desc': 'A detective wakes up in a town with no one left — but someone is still leaving notes.', 'rating': 'General'},
    {'creator_idx': 1, 'title': 'Paper Cranes', 'genre': 'Romance', 'desc': 'Two strangers exchange messages folded into origami cranes left at the same park bench.', 'rating': 'General'},
    {'creator_idx': 2, 'title': 'Red Mist', 'genre': 'Horror', 'desc': 'A mountain hiking trip goes wrong when the fog rolls in with something inside it.', 'rating': 'Mature'},
    {'creator_idx': 0, 'title': 'Voltage', 'genre': 'Action', 'desc': 'An underground boxer discovers she can channel electricity — and someone wants to weaponize it.', 'rating': 'Mature'},
    {'creator_idx': 1, 'title': 'The Cartographer', 'genre': 'Adventure', 'desc': 'A mapmaker is hired to chart a territory that no map has ever shown accurately.', 'rating': 'General'},
    {'creator_idx': 2, 'title': 'Soft Shutdown', 'genre': 'Psychological', 'desc': 'A therapist realizes her newest patient may not be entirely human.', 'rating': 'General'},
]


def clear_demo(app):
    with app.app_context():
        emails = [c['email'] for c in DEMO_CREATORS]
        users = User.query.filter(User.email.in_(emails)).all()
        for u in users:
            for v in u.videos:
                db.session.delete(v)
            for s in u.series:
                for ep in s.episodes:
                    db.session.delete(ep)
                db.session.delete(s)
            db.session.delete(u)
        db.session.commit()
        print(f'Cleared {len(users)} demo creator accounts and all their content.')


def seed(app):
    with app.app_context():
        creators = []
        for c in DEMO_CREATORS:
            existing = User.query.filter_by(email=c['email']).first()
            if existing:
                creators.append(existing)
                print(f'  Already exists: {c["name"]}')
                continue
            u = User(
                email=c['email'],
                display_name=c['name'],
                password_hash=bcrypt.generate_password_hash(c['pw']).decode('utf-8'),
                is_creator=True,
            )
            db.session.add(u)
            db.session.flush()
            creators.append(u)
            print(f'  Created creator: {c["name"]}')

        vid_index = 0
        total_videos = 0

        # Series + episodes
        for s_data in DEMO_SERIES:
            creator = creators[s_data['creator_idx']]
            series = Series(
                creator_id=creator.id,
                title=s_data['title'],
                description=s_data['description'],
                genre=s_data['genre'],
                language=s_data['language'],
                content_rating=s_data['content_rating'],
                thumbnail_url=s_data['thumbnail'],
                is_published=True,
            )
            db.session.add(series)
            db.session.flush()
            print(f'  Series: {s_data["title"]}')

            for ep in s_data['episodes']:
                v = Video(
                    creator_id=creator.id,
                    series_id=series.id,
                    title=ep['title'],
                    description=ep['desc'],
                    genre=s_data['genre'],
                    language=s_data['language'],
                    video_type='Episode',
                    content_rating=s_data['content_rating'],
                    video_url=vurl(vid_index),
                    thumbnail_url=thumb(f"ep_{s_data['title'][:6]}_{ep['ep']}"),
                    episode_number=ep['ep'],
                    season_number=1,
                    duration=420 + (ep['ep'] * 180),
                    view_count=(500 - ep['ep'] * 40) + (vid_index * 13),
                    is_published=True,
                )
                db.session.add(v)
                vid_index += 1
                total_videos += 1

        # Standalone videos
        for i, sv in enumerate(STANDALONE_VIDEOS):
            creator = creators[sv['creator_idx']]
            v = Video(
                creator_id=creator.id,
                title=sv['title'],
                description=sv['desc'],
                genre=sv['genre'],
                language='English',
                video_type='Standalone',
                content_rating=sv['rating'],
                video_url=vurl(vid_index),
                thumbnail_url=thumb(f"standalone_{i}"),
                duration=600 + (i * 120),
                view_count=100 + (i * 47),
                is_published=True,
            )
            db.session.add(v)
            vid_index += 1
            total_videos += 1

        db.session.commit()
        print(f'\nDone! Seeded {len(DEMO_SERIES)} series and {total_videos} total videos.')
        print('To remove demo data later: python seed_demo.py --clear')


if __name__ == '__main__':
    app = create_app()
    if '--clear' in sys.argv:
        clear_demo(app)
    else:
        print('Seeding demo data...')
        seed(app)
