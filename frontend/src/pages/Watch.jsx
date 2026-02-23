import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVideo, addWatchLater, removeWatchLater, getWatchLaterStatus } from '../api'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'
import './Watch.css'

export default function Watch() {
  const { id } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seriesEpisodes, setSeriesEpisodes] = useState([])

  useEffect(() => {
    setLoading(true)
    setError('')
    getVideo(id)
      .then(({ data }) => {
        setVideo(data.video)
        if (data.video.series_id && user) {
          return getWatchLaterStatus(id)
            .then(({ data: s }) => setSaved(s.saved))
            .catch(() => {})
        }
      })
      .catch(() => setError('Video not found or unavailable.'))
      .finally(() => setLoading(false))
  }, [id, user])

  const toggleSave = async () => {
    if (!user || saving) return
    setSaving(true)
    try {
      if (saved) {
        await removeWatchLater(id)
        setSaved(false)
      } else {
        await addWatchLater(id)
        setSaved(true)
      }
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (error) return <div className="watch-error container"><p>{error}</p><Link to="/home" className="btn btn-ghost">Back to Home</Link></div>
  if (!video) return null

  return (
    <div className="watch-page">
      <div className="watch-player-wrap">
        <video
          className="watch-player"
          src={video.video_url}
          controls
          autoPlay={false}
          poster={video.thumbnail_url || undefined}
        />
      </div>

      <div className="container watch-body">
        <div className="watch-main">
          {/* Tags */}
          <div className="watch-tags">
            {video.genre && <span className="tag tag-cyan">{video.genre}</span>}
            {video.series_title && <span className="tag tag-violet">Series</span>}
            {video.episode_number && (
              <span className="tag tag-violet">
                S{video.season_number || 1} E{video.episode_number}
              </span>
            )}
          </div>

          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-meta">
            {video.creator_name && (
              <span className="watch-creator">By {video.creator_name}</span>
            )}
            {video.series_title && (
              <Link to={`/series/${video.series_id}`} className="watch-series-link">
                {video.series_title}
              </Link>
            )}
            {video.duration_formatted && <span>{video.duration_formatted}</span>}
            <span>{Number(video.view_count).toLocaleString()} views</span>
          </div>

          {user && (
            <button
              className={`btn watch-save-btn ${saved ? 'btn-outline-cyan' : 'btn-ghost'}`}
              onClick={toggleSave}
              disabled={saving}
            >
              {saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" /></svg>
                  Saved
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" /></svg>
                  Save to Watch Later
                </>
              )}
            </button>
          )}

          {video.description && (
            <div className="watch-description">
              <h3>About this video</h3>
              <p>{video.description}</p>
            </div>
          )}
        </div>

        {/* Episode sidebar if part of a series */}
        {video.series_id && (
          <div className="watch-sidebar">
            <h3 className="sidebar-title">More from this Series</h3>
            <Link to={`/series/${video.series_id}`} className="btn btn-ghost sidebar-series-btn">
              View All Episodes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
