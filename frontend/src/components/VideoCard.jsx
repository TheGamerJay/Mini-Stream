import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addWatchLater, removeWatchLater } from '../api'
import { useAuth } from '../context/AuthContext'
import './VideoCard.css'

export default function VideoCard({ item, type = 'video' }) {
  const isVideo = type === 'video'
  const link = isVideo ? `/watch/${item.video_id ?? item.id}` : `/series/${item.id}`
  const thumbnail = item.thumbnail_url || item.banner_url || null
  const { user } = useAuth()
  const navigate = useNavigate()

  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (bookmarking) return
    setBookmarking(true)
    try {
      if (bookmarked) {
        await removeWatchLater(item.video_id ?? item.id)
        setBookmarked(false)
      } else {
        await addWatchLater(item.video_id ?? item.id)
        setBookmarked(true)
      }
    } catch { /* ignore */ } finally {
      setBookmarking(false)
    }
  }

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
        {isVideo && (
          <button
            className={`video-card__bookmark${bookmarked ? ' bookmarked' : ''}`}
            onClick={handleBookmark}
            title={bookmarked ? 'Remove from list' : 'Save to Watch Later'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
              <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" />
            </svg>
          </button>
        )}
        {item.content_rating && (
          <span className="video-card__rating">{item.content_rating}</span>
        )}
        {isVideo && item.progress_pct > 0 && item.progress_pct < 100 && (
          <div className="video-card__progress">
            <div className="video-card__progress-fill" style={{ width: `${item.progress_pct}%` }} />
          </div>
        )}
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
          {item.language && <span className="dot">·</span>}
          {item.language && <span className="video-card__lang">{item.language}</span>}
        </div>
        {isVideo && item.series_title && (
          <p className="video-card__series">{item.series_title}</p>
        )}
      </div>
    </Link>
  )
}
