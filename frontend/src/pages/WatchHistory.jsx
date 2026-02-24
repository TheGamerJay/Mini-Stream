import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getContinueWatching, getHistory } from '../api'
import VideoCard from '../components/VideoCard'
import './WatchHistory.css'

const TABS = [
  { key: 'progress', label: 'In Progress', api: () => getContinueWatching(), key2: 'continue_watching' },
  { key: 'completed', label: 'Completed',  api: () => getHistory({ completed: true }), key2: 'history' },
]

export default function WatchHistory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'progress'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setItems([])
    const current = TABS.find((t) => t.key === tab) || TABS[0]
    current.api()
      .then(({ data }) => setItems(data[current.key2] || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tab])

  const emptyMsg = tab === 'progress'
    ? "You haven't started any videos yet."
    : "No completed videos yet. Finish watching something!"

  return (
    <div className="history-page container fade-in">
      <div className="history-header">
        <h1>Watch History</h1>
      </div>

      <div className="history-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`history-tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setSearchParams({ tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="history-empty">
          <p>{emptyMsg}</p>
          <Link to="/home" className="btn btn-primary">Explore Content</Link>
        </div>
      ) : (
        <div className="history-grid">
          {items.map((item) => (
            <VideoCard key={item.video_id ?? item.id} item={item} type="video" />
          ))}
        </div>
      )}
    </div>
  )
}
