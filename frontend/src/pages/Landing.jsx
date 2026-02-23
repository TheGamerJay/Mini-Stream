import { Link } from 'react-router-dom'
import './Landing.css'

const FEATURES = [
  {
    title: 'Cinematic First',
    desc: 'A platform built around the viewing experience. No clutter, no noise — just your story and the screen.',
  },
  {
    title: 'Creator Owned',
    desc: 'Upload original series, standalone videos, or animated shorts. Your content, your creative vision.',
  },
  {
    title: 'No Social Noise',
    desc: 'No comments. No likes. No follower counts. MiniStream is about storytelling, not metrics.',
  },
  {
    title: 'Genre Focused',
    desc: 'Anime, Action, Fantasy, Romance, Horror, Slice of Life — discover content by what you actually want to watch.',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero__glow landing-hero__glow--cyan" />
        <div className="landing-hero__glow landing-hero__glow--violet" />
        <div className="container landing-hero__content">
          <img src="/Mini Stream logo.png" alt="MiniStream" className="landing-hero__logo" />
          <div className="landing-hero__badge tag tag-cyan">Now Open to Creators</div>
          <h1 className="landing-hero__title">
            Where Indie Creators <br />
            <span className="gradient-text">Tell Their Stories</span>
          </h1>
          <p className="landing-hero__subtitle">
            MiniStream is a cinematic streaming platform for original anime-style series,
            animated shorts, and indie visual storytelling. No ads. No noise. Just content.
          </p>
          <div className="landing-hero__actions">
            <span className="btn btn-primary landing-cta" style={{ cursor: 'default', pointerEvents: 'none' }}>Get Started</span>
            <Link to="/home" className="btn btn-ghost">Explore Content</Link>
          </div>
        </div>
        <div className="landing-hero__preview">
          <div className="preview-card preview-card--1">
            <div className="preview-card__glow" />
            <div className="preview-card__label">Featured Series</div>
            <div className="preview-card__title">Original Anime Series</div>
          </div>
          <div className="preview-card preview-card--2">
            <div className="preview-card__label">Trending</div>
            <div className="preview-card__title">Indie Shorts</div>
          </div>
          <div className="preview-card preview-card--3">
            <div className="preview-card__label">New Episodes</div>
            <div className="preview-card__title">Fantasy Chronicles</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features container">
        <h2 className="section-title">Built Different</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creator CTA */}
      <section className="landing-creator container">
        <div className="creator-cta">
          <div className="creator-cta__glow" />
          <div className="creator-cta__content">
            <h2>Ready to Share Your Story?</h2>
            <p>
              Upload original videos and series. Reach viewers who care about
              indie storytelling. No algorithm manipulation — just great content.
            </p>
          </div>
        </div>
      </section>

      {/* Genre preview */}
      <section className="landing-genres container">
        <h2 className="section-title">Every Genre, One Place</h2>
        <div className="genres-grid">
          {['Anime', 'Action', 'Fantasy', 'Romance', 'Horror', 'Slice of Life', 'Sci-Fi', 'Mystery'].map((g) => (
            <Link key={g} to={`/home?genre=${encodeURIComponent(g)}`} className="genre-chip">
              {g}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
