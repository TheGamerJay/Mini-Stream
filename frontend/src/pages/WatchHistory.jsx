import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getContinueWatching, getHistory } from '../api'
import VideoCard from '../components/VideoCard'
import SkeletonCard from '../components/SkeletonCard'
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
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    setItems([])
    setFilter('')
    const current = TABS.find((t) => t.key === tab) || TABS[0]
    current.api()
      .then(({ data }) => setItems(data[current.key2] || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tab])

  const emptyMsg = tab === 'progress'
    ? "You haven't started any videos yet."
    : "No completed videos yet. Finish watching something!"

  const filtered = filter
    ? items.filter(i => {
        const title = i.title || i.video?.title || ''
        return title.toLowerCase().includes(filter.toLowerCase())
      })
    : items

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

      {!loading && items.length > 0 && (
        <div className="history-filter">
          <input
            className="wl-filter-input"
            placeholder="Search history…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {filter && <span className="history-count">{filtered.length} of {items.length}</span>}
        </div>
      )}

      {loading ? (
        <div className="history-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">
          <p>{filter ? `No videos match "${filter}".` : emptyMsg}</p>
          {!filter && <Link to="/home" className="btn btn-primary">Explore Content</Link>}
        </div>
      ) : (
        <div className="history-grid">
          {filtered.map((item) => (
            <VideoCard key={item.video_id ?? item.id} item={item} type="video" />
          ))}
        </div>
      )}
    </div>
  )
}
