# MiniStream

A creator-first streaming platform for original anime-style series, animated shorts, and indie visual storytelling.

**Stack:** React + Vite · Flask · PostgreSQL · Cloudinary · Railway

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in your env vars
cp ../.env.example .env

# Run migrations
flask db init
flask db migrate -m "Initial"
flask db upgrade

# Start
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Flask session secret |
| `JWT_SECRET_KEY` | JWT signing key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ORIGINS` | Frontend URL(s) |

---

## Pages

| Route | Description |
|---|---|
| `/` | Public landing page |
| `/home` | Discover page with hero + rows |
| `/watch/:id` | Cinematic video player |
| `/series/:id` | Series detail + episode list |
| `/creator` | Creator dashboard (upload, manage, stats) |
| `/watch-later` | Private saved videos |
| `/about`, `/how-it-works`, `/content-rules`, `/dmca`, `/privacy`, `/terms`, `/contact` | Static pages |

---

## Deployment (Railway)

1. Create a Railway project
2. Add a PostgreSQL service
3. Deploy backend from `/backend` — set start command: `gunicorn wsgi:application`
4. Deploy frontend from `/frontend` — set build: `npm run build`, publish: `dist`
5. Set all environment variables in Railway dashboard
