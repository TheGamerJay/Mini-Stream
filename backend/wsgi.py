from dotenv import load_dotenv
load_dotenv()

from app import create_app, db

application = create_app('production')

# Auto-create tables on startup — wrapped so a DB blip doesn't crash gunicorn
try:
    with application.app_context():
        db.create_all()
        print("Database tables created/verified.")
        # Safe ALTER TABLE migrations — each runs in its own connection/transaction
        # so a failure on one column never blocks the rest.
        from sqlalchemy import text
        migrations = [
            "ALTER TABLE videos ADD COLUMN IF NOT EXISTS subtitle_url VARCHAR(500)",
            "ALTER TABLE videos ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP",
            "ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE NOT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_token VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_genres TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE NOT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL",
        ]
        applied = 0
        for sql in migrations:
            try:
                with db.engine.connect() as conn:
                    conn.execute(text(sql))
                    conn.commit()
                applied += 1
            except Exception:
                pass
        print(f"Column migrations applied ({applied}/{len(migrations)}).")
except Exception as e:
    print(f"Warning: could not run db.create_all() on startup: {e}")
