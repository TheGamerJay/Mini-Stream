import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCreatorProfile } from '../api'
import VideoCard from '../components/VideoCard'
import SkeletonCard from '../components/SkeletonCard'
import './CreatorProfile.css'

export default function CreatorProfile() {
  const { id } = useParams()
  const [creator, setCreator] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getCreatorProfile(id)
      .then(({ data }) => {
        setCreator(data.creator)
        setVideos(data.videos)
      })
      .catch(() => setError('Creator not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="container cp-page fade-in">
      <div className="cp-header-skeleton">
        <div className="cp-avatar-skeleton" />
        <div style={{ flex: 1 }}>
          <div className="skeleton-line" style={{ width: 180, height: 20, marginBottom: 10 }} />
          <div className="skeleton-line" style={{ width: 260, height: 13 }} />
        </div>
      </div>
      <div className="cp-grid">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="container cp-page">
      <p>{error}</p>
      <Link to="/home" className="btn btn-ghost">Back to Home</Link>
    </div>
  )

  return (
    <div className="container cp-page fade-in">
      <div className="cp-header">
        <div className="cp-avatar">
          {creator.avatar_url
            ? <img src={creator.avatar_url} alt={creator.display_name} />
            : <span>{creator.display_name.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="cp-info">
          <h1 className="cp-name">{creator.display_name}</h1>
          <div className="cp-badges">
            <span className="tag tag-cyan">✦ Creator</span>
            <span className="cp-count">{creator.video_count} {creator.video_count === 1 ? 'video' : 'videos'}</span>
          </div>
          {creator.bio && <p className="cp-bio">{creator.bio}</p>}
          <div className="cp-links">
            {creator.website && (
              <a href={creator.website} target="_blank" rel="noopener noreferrer" className="cp-website">
                🔗 {creator.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {creator.location && <span className="cp-location">📍 {creator.location}</span>}
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <p className="cp-empty">This creator hasn't published any videos yet.</p>
      ) : (
        <>
          <h2 className="cp-section-title">Videos</h2>
          <div className="cp-grid">
            {videos.map(v => <VideoCard key={v.id} item={v} type="video" />)}
          </div>
        </>
      )}
    </div>
  )
}
