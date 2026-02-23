from dotenv import load_dotenv
load_dotenv()

from app import create_app, db

application = create_app('production')

# Auto-create tables on startup — wrapped so a DB blip doesn't crash gunicorn
try:
    with application.app_context():
        db.create_all()
        print("Database tables created/verified.")
except Exception as e:
    print(f"Warning: could not run db.create_all() on startup: {e}")
