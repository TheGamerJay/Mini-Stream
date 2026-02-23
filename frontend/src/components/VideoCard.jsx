import { Link } from 'react-router-dom'
import './VideoCard.css'

export default function VideoCard({ item, type = 'video' }) {
  const isVideo = type === 'video'
  const link = isVideo ? `/watch/${item.id}` : `/series/${item.id}`
  const thumbnail = item.thumbnail_url || item.banner_url || null

  return (
    <Link to={link} className="video-card">
      <div className="video-card__thumb">
        {thumbnail ? (
          <img src={thumbnail} alt={item.title} loading="lazy" />
        ) : (
          <div className="video-card__placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        )}
        <div className="video-card__overlay">
          <div className="video-card__play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
        {item.duration_formatted && (
          <span className="video-card__duration">{item.duration_formatted}</span>
        )}
        {!isVideo && item.episode_count !== undefined && (
          <span className="video-card__badge">{item.episode_count} ep</span>
        )}
      </div>
      <div className="video-card__info">
        <h3 className="video-card__title">{item.title}</h3>
        <div className="video-card__meta">
          {item.creator_name && (
            <span className="video-card__creator-wrap">
              {item.creator_name}
              <span className="creator-badge">✦ Creator</span>
            </span>
          )}
          {item.genre && <span className="dot">·</span>}
          {item.genre && <span>{item.genre}</span>}
        </div>
        {isVideo && item.series_title && (
          <p className="video-card__series">{item.series_title}</p>
        )}
      </div>
    </Link>
  )
}
