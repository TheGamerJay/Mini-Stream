import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHistory } from '../api'
import VideoCard from '../components/VideoCard'
import './WatchHistory.css'

export default function WatchHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then(({ data }) => setItems(data.history))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="history-page container fade-in">
      <div className="history-header">
        <h1>Watch History</h1>
        <p>{items.length} {items.length === 1 ? 'video' : 'videos'}</p>
      </div>
      {items.length === 0 ? (
        <div className="history-empty">
          <p>No watch history yet.</p>
          <Link to="/home" className="btn btn-primary">Explore Content</Link>
        </div>
      ) : (
        <div className="history-grid">
          {items.map((item) => (
            <VideoCard key={item.id} item={item} type="video" />
          ))}
        </div>
      )}
    </div>
  )
}
