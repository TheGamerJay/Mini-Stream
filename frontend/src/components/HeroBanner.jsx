import { Link } from 'react-router-dom'
import './HeroBanner.css'

export default function HeroBanner({ featured }) {
  if (!featured) return null

  const isSeries = !featured.video_url
  const link = isSeries ? `/series/${featured.id}` : `/watch/${featured.id}`
  const bg = featured.banner_url || featured.thumbnail_url

  return (
    <div className="hero" style={bg ? { '--hero-bg': `url(${bg})` } : {}}>
      <div className="hero__bg" />
      <div className="hero__content container">
        <div className="hero__inner">
          <div className="hero__tags">
            {featured.genre && <span className="tag tag-cyan">{featured.genre}</span>}
            {!isSeries && featured.episode_number && (
              <span className="tag tag-violet">Episode {featured.episode_number}</span>
            )}
            {isSeries && <span className="tag tag-violet">Series</span>}
          </div>
          <h1 className="hero__title">{featured.title}</h1>
          {featured.description && (
            <p className="hero__desc">{featured.description.slice(0, 200)}{featured.description.length > 200 ? '...' : ''}</p>
          )}
          <div className="hero__meta">
            {featured.creator_name && <span>By {featured.creator_name}</span>}
            {isSeries && featured.episode_count !== undefined && (
              <span>{featured.episode_count} Episodes</span>
            )}
            {!isSeries && featured.duration_formatted && (
              <span>{featured.duration_formatted}</span>
            )}
          </div>
          <div className="hero__actions">
            <Link to={link} className="btn btn-primary hero__play-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              {isSeries ? 'View Series' : 'Watch Now'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
