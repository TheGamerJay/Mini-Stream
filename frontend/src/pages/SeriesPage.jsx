import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSeries } from '../api'
import './SeriesPage.css'

function formatDuration(seconds) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h) return `${h}h ${m % 60}m`
  return `${m}m`
}

export default function SeriesPage() {
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSeries(id)
      .then(({ data }) => setSeries(data.series))
      .catch(() => setError('Series not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (error) return <div className="series-error container"><p>{error}</p><Link to="/home" className="btn btn-ghost">Back</Link></div>
  if (!series) return null

  const episodes = series.episodes || []

  return (
    <div className="series-page">
      {/* Banner */}
      <div
        className="series-banner"
        style={series.banner_url ? { '--banner': `url(${series.banner_url})` } : {}}
      >
        <div className="series-banner__bg" />
        <div className="series-banner__content container">
          {series.thumbnail_url && (
            <img src={series.thumbnail_url} alt={series.title} className="series-thumb" />
          )}
          <div className="series-info">
            <div className="series-tags">
              <span className="tag tag-cyan">{series.genre}</span>
              <span className="tag tag-violet">Series</span>
            </div>
            <h1 className="series-title">{series.title}</h1>
            <div className="series-meta">
              {series.creator_name && <span>By {series.creator_name}</span>}
              <span>{series.episode_count} Episodes</span>
            </div>
            {series.description && <p className="series-desc">{series.description}</p>}
            {episodes.length > 0 && (
              <Link to={`/watch/${episodes[0].id}`} className="btn btn-primary series-play-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                Play Episode 1
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Episode list */}
      <div className="container series-episodes">
        <h2 className="episodes-heading">Episodes</h2>
        {episodes.length === 0 ? (
          <p className="no-episodes">No episodes yet.</p>
        ) : (
          <div className="episodes-list">
            {episodes.map((ep) => (
              <Link key={ep.id} to={`/watch/${ep.id}`} className="episode-row">
                <div className="episode-num">
                  {ep.season_number && ep.episode_number
                    ? `S${ep.season_number} E${ep.episode_number}`
                    : ep.episode_number || '—'}
                </div>
                {ep.thumbnail_url && (
                  <div className="episode-thumb">
                    <img src={ep.thumbnail_url} alt={ep.title} />
                    <div className="episode-thumb__overlay">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </div>
                )}
                <div className="episode-info">
                  <h3 className="episode-title">{ep.title}</h3>
                  {ep.description && <p className="episode-desc">{ep.description.slice(0, 120)}{ep.description.length > 120 ? '...' : ''}</p>}
                </div>
                <div className="episode-dur">
                  {ep.duration_formatted || '—'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
