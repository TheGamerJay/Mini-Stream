from dotenv import load_dotenv
load_dotenv()

from app import create_app, db

application = create_app('production')

# Auto-create tables on startup (safe to run repeatedly)
with application.app_context():
    db.create_all()
