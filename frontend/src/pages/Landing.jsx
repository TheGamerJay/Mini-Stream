import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getHomeData } from '../api'
import GuestAuthModal from '../components/GuestAuthModal'
import './Landing.css'

function LandingCard({ video, onGuestClick }) {
  const thumb = video.thumbnail_url || null
  return (
    <div
      className="lcard"
      onClick={onGuestClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onGuestClick()}
    >
      <div className="lcard__thumb">
        {thumb ? (
          <img src={thumb} alt={video.title} loading="lazy" />
        ) : (
          <div className="lcard__placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        )}
        <div className="lcard__overlay">
          <div className="lcard__play">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
        {video.content_rating && <span className="lcard__cert">{video.content_rating}</span>}
        {video.duration_formatted && <span className="lcard__dur">{video.duration_formatted}</span>}
      </div>
      <div className="lcard__info">
        <p className="lcard__title">{video.title}</p>
        {video.genre && <span className="lcard__genre">{video.genre}</span>}
      </div>
    </div>
  )
}

const GENRES = [
  'Anime', 'Action', 'Adventure', 'Fantasy', 'Romance', 'Horror',
  'Slice of Life', 'Sci-Fi', 'Mystery', 'Thriller', 'Supernatural',
  'Isekai', 'Psychological', 'Experimental',
]

export default function Landing() {
  const [homeData, setHomeData] = useState(null)
  const [slide, setSlide] = useState(0)
  const [guestModal, setGuestModal] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    getHomeData().then(({ data }) => setHomeData(data)).catch(() => {})
  }, [])

  const heroVideos = homeData?.trending?.slice(0, 3) || []

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (heroVideos.length > 1) {
      timerRef.current = setInterval(
        () => setSlide(s => (s + 1) % heroVideos.length),
        6000
      )
    }
  }, [heroVideos.length])

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [resetTimer])

  const goTo = (idx) => { setSlide(idx); resetTimer() }
  const prev = () => { setSlide(s => (s - 1 + heroVideos.length) % heroVideos.length); resetTimer() }
  const next = () => { setSlide(s => (s + 1) % heroVideos.length); resetTimer() }

  const openModal = () => setGuestModal(true)

  const trending = homeData?.trending || []
  const newReleases = homeData?.recently_added || []

  return (
    <div className="landing">

      {/* Info notice */}
      <div className="landing-notice">
        <span>Browsing is available to all. Viewing content requires an account.</span>
        <Link to="/signup" className="landing-notice__link">Create free account →</Link>
      </div>

      {/* ─── Hero Slideshow ─── */}
      <section className="hero-slider">
        {heroVideos.length === 0 ? (
          <div className="hero-slide hero-slide--visible hero-slide--fallback">
            <div className="hero-glow hero-glow--cyan" />
            <div className="hero-glow hero-glow--violet" />
            <div className="hero-slide__content container">
              <img src="/Mini Stream logo.png" alt="MiniStream" className="landing-logo" />
              <div className="tag tag-cyan" style={{ marginBottom: 18 }}>Now Open to Creators</div>
              <h1 className="hero-title">
                Where Indie Creators <br />
                <span className="gradient-text">Tell Their Stories</span>
              </h1>
              <p className="hero-desc">
                A cinematic streaming platform for original anime-style series, animated shorts,
                and indie visual storytelling. No ads. No noise. Just content.
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary hero-btn">Create Free Account</Link>
                <Link to="/login" className="btn btn-ghost hero-btn">Sign In</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {heroVideos.map((video, i) => (
              <div
                key={video.id}
                className={`hero-slide${i === slide ? ' hero-slide--visible' : ''}`}
                aria-hidden={i !== slide}
              >
                {video.thumbnail_url && (
                  <div
                    className="hero-slide__bg"
                    style={{ backgroundImage: `url(${video.thumbnail_url})` }}
                  />
                )}
                <div className="hero-slide__overlay" />
                <div className="hero-slide__content container">
                  <div className="hero-slide__tags">
                    {video.genre && <span className="hero-genre">{video.genre}</span>}
                    {video.content_rating && <span className="hero-cert">{video.content_rating}</span>}
                    {video.language && video.language !== 'English' && (
                      <span className="hero-cert">{video.language}</span>
                    )}
                  </div>
                  <h1 className="hero-slide__title">{video.title}</h1>
                  {video.description && (
                    <p className="hero-desc">
                      {video.description.length > 150
                        ? video.description.slice(0, 150) + '…'
                        : video.description}
                    </p>
                  )}
                  <div className="hero-actions">
                    <button className="btn btn-primary hero-btn" onClick={openModal}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 7, flexShrink: 0 }}>
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                      Sign in to Watch
                    </button>
                    <Link to="/signup" className="btn btn-ghost hero-btn">Create Free Account</Link>
                  </div>
                </div>
              </div>
            ))}

            {heroVideos.length > 1 && (
              <>
                <button className="hero-arrow hero-arrow--prev" onClick={prev} aria-label="Previous">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>
                <button className="hero-arrow hero-arrow--next" onClick={next} aria-label="Next">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
                <div className="hero-dots">
                  {heroVideos.map((_, i) => (
                    <button
                      key={i}
                      className={`hero-dot${i === slide ? ' hero-dot--active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* ─── Trending Now ─── */}
      {trending.length > 0 && (
        <section className="landing-row">
          <h2 className="landing-row__heading container">Trending Now</h2>
          <div className="landing-row__scroll">
            <div className="landing-row__inner">
              {trending.map(v => (
                <LandingCard key={v.id} video={v} onGuestClick={openModal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── New Releases ─── */}
      {newReleases.length > 0 && (
        <section className="landing-row">
          <h2 className="landing-row__heading container">New Releases</h2>
          <div className="landing-row__scroll">
            <div className="landing-row__inner">
              {newReleases.map(v => (
                <LandingCard key={v.id} video={v} onGuestClick={openModal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Genres ─── */}
      <section className="landing-genres container">
        <h2 className="landing-row__heading">Every Genre, One Place</h2>
        <div className="genres-grid">
          {GENRES.map(g => (
            <Link key={g} to={`/home?genre=${encodeURIComponent(g)}`} className="genre-chip">{g}</Link>
          ))}
        </div>
      </section>

      {guestModal && <GuestAuthModal onClose={() => setGuestModal(false)} />}
    </div>
  )
}
