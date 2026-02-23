import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWatchLater, removeWatchLater } from '../api'
import VideoCard from '../components/VideoCard'
import './WatchLater.css'

export default function WatchLater() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWatchLater()
      .then(({ data }) => setItems(data.watch_later))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const remove = async (videoId) => {
    try {
      await removeWatchLater(videoId)
      setItems((prev) => prev.filter((i) => i.video_id !== videoId))
    } catch { /* ignore */ }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="wl-page container fade-in">
      <div className="wl-header">
        <h1>Watch Later</h1>
        <p>{items.length} saved {items.length === 1 ? 'video' : 'videos'}</p>
      </div>
      {items.length === 0 ? (
        <div className="wl-empty">
          <p>Nothing saved yet.</p>
          <Link to="/home" className="btn btn-primary">Explore Content</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {items.map((item) => (
            item.video && (
              <div key={item.id} className="wl-item">
                <VideoCard item={item.video} type="video" />
                <button className="wl-remove btn btn-ghost" onClick={() => remove(item.video_id)}>
                  Remove
                </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
