import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWatchLater, removeWatchLater } from '../api'
import VideoCard from '../components/VideoCard'
import SkeletonCard from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import './WatchLater.css'

export default function WatchLater() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

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

  const filtered = filter
    ? items.filter(i => i.video?.title?.toLowerCase().includes(filter.toLowerCase()))
    : items

  if (loading) return (
    <div className="wl-page container fade-in">
      <div className="wl-header"><h1>Watch Later</h1></div>
      <div className="wl-grid">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  return (
    <div className="wl-page container fade-in">
      <div className="wl-header">
        <h1>Watch Later</h1>
        <p>{filtered.length}{filter ? ` of ${items.length}` : ''} {items.length === 1 ? 'video' : 'videos'}</p>
      </div>
      {items.length > 0 && (
        <div className="wl-filter">
          <input
            className="wl-filter-input"
            placeholder="Search saved videos…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      )}
      {items.length === 0 ? (
        <EmptyState
          type="watchlater"
          title="Your list is empty"
          message="Save videos to watch later and they'll appear here."
          action={<Link to="/home" className="btn btn-primary">Explore Content</Link>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState type="search" title={`No results for "${filter}"`} message="Try a different search term." />
      ) : (
        <div className="wl-grid">
          {filtered.map((item) => (
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
