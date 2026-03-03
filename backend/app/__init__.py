import os
import cloudinary
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from .config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address, default_limits=["300 per minute"])
cache = Cache()


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    app.config.setdefault('CACHE_TYPE', 'SimpleCache')
    app.config.setdefault('CACHE_DEFAULT_TIMEOUT', 120)
    cache.init_app(app)

    CORS(
        app,
        origins=app.config['CORS_ORIGINS'],
        supports_credentials=True,
    )

    cloudinary.config(
        cloud_name=app.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key=app.config.get('CLOUDINARY_API_KEY'),
        api_secret=app.config.get('CLOUDINARY_API_SECRET'),
    )

    from .routes.auth import auth_bp
    from .routes.videos import videos_bp
    from .routes.series import series_bp
    from .routes.creator import creator_bp
    from .routes.discover import discover_bp
    from .routes.admin import admin_bp
    from .routes.studio import studio_bp
    from .routes.comments import comments_bp
    from .routes.follows import follows_bp
    from .routes.notifications import notifications_bp
    from .routes.playlists import playlists_bp
    from .routes.donations import donations_bp
    from .routes.onboarding import onboarding_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(videos_bp, url_prefix='/api/videos')
    app.register_blueprint(series_bp, url_prefix='/api/series')
    app.register_blueprint(creator_bp, url_prefix='/api/creator')
    app.register_blueprint(discover_bp, url_prefix='/api/stream')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(studio_bp, url_prefix='/api/studio')
    app.register_blueprint(comments_bp, url_prefix='/api/videos')
    app.register_blueprint(follows_bp, url_prefix='/api/creators')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(playlists_bp, url_prefix='/api/playlists')
    app.register_blueprint(donations_bp, url_prefix='/api/creators')
    app.register_blueprint(onboarding_bp, url_prefix='/api/onboarding')

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    # Serve React SPA in production (when frontend/dist exists)
    _frontend_dist = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', '..', 'frontend', 'dist'
    )
    _frontend_dist = os.path.normpath(_frontend_dist)

    if os.path.isdir(_frontend_dist):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            if path.startswith('api/'):
                return {'error': 'not found'}, 404
            full = os.path.join(_frontend_dist, path)
            if path and os.path.exists(full):
                return send_from_directory(_frontend_dist, path)
            return send_from_directory(_frontend_dist, 'index.html')

    return app
