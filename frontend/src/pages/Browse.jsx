import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { browseVideos } from '../api'
import VideoCard from '../components/VideoCard'
import './Browse.css'

const GENRES = [
  'Anime','Action','Adventure','Comedy','Drama','Fantasy','Romance',
  'Horror','Supernatural','Thriller','Sci-Fi','Mystery','Psychological',
  'Slice of Life','Mecha','Isekai','Historical','Seinen','Shojo','Shonen','Experimental',
]
const LANGUAGES = ['English','Spanish','Portuguese','French','German','Italian','Japanese']
const TYPES = [
  { label: 'Movies', value: 'movie' },
  { label: 'Shows', value: 'show' },
  { label: 'Standalone', value: 'standalone' },
]
const DURATIONS = [
  { label: 'Short  (<30 min)', value: 'short' },
  { label: 'Medium  (30–90 min)', value: 'medium' },
  { label: 'Long  (90+ min)', value: 'long' },
]

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [genre, setGenre] = useState(searchParams.get('genre') || '')
  const [language, setLanguage] = useState(searchParams.get('language') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [duration, setDuration] = useState(searchParams.get('duration') || '')
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const buildParams = useCallback(() => {
    const p = {}
    if (q) p.q = q
    if (genre) p.genre = genre
    if (language) p.language = language
    if (type) p.type = type
    if (duration) p.duration = duration
    return p
  }, [q, genre, language, type, duration])

  const fetchVideos = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, ...buildParams() }
      const { data } = await browseVideos(params)
      if (p === 1) {
        setVideos(data.videos)
      } else {
        setVideos((prev) => [...prev, ...data.videos])
      }
      setPage(data.page)
      setPages(data.pages)
      setTotal(data.total)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [buildParams])

  useEffect(() => {
    setPage(1)
    fetchVideos(1)
    setSearchParams(buildParams())
  }, [genre, language, type, duration])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVideos(1)
    setSearchParams(buildParams())
  }

  const loadMore = () => fetchVideos(page + 1)

  const toggle = (val, setter) => (clicked) => setter((prev) => prev === clicked ? '' : clicked)

  return (
    <div className="browse-page">
      <div className="container browse-inner">
        <div className="browse-head">
          <h1 className="browse-title">Browse Videos</h1>
          <form className="browse-search" onSubmit={handleSearch}>
            <input
              className="browse-input"
              placeholder="Search by title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn btn-primary browse-search-btn">Search</button>
          </form>
        </div>

        <div className="browse-filters">
          {/* Type */}
          <div className="filter-row">
            <span className="filter-label">Type</span>
            <div className="filter-chips">
              {TYPES.map(({ label, value }) => (
                <button
                  key={value}
                  className={`filter-chip${type === value ? ' active' : ''}`}
                  onClick={() => toggle(type, setType)(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="filter-row">
            <span className="filter-label">Length</span>
            <div className="filter-chips">
              {DURATIONS.map(({ label, value }) => (
                <button
                  key={value}
                  className={`filter-chip${duration === value ? ' active' : ''}`}
                  onClick={() => toggle(duration, setDuration)(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div className="filter-row">
            <span className="filter-label">Genre</span>
            <div className="filter-chips">
              {GENRES.map((g) => (
                <button
                  key={g}
                  className={`filter-chip${genre === g ? ' active' : ''}`}
                  onClick={() => toggle(genre, setGenre)(g)}
                  type="button"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="filter-row">
            <span className="filter-label">Language</span>
            <div className="filter-chips">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  className={`filter-chip${language === l ? ' active' : ''}`}
                  onClick={() => toggle(language, setLanguage)(l)}
                  type="button"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && (
          <p className="browse-count">
            {total === 0 ? 'No videos found.' : `${total.toLocaleString()} video${total !== 1 ? 's' : ''}`}
          </p>
        )}

        <div className="browse-grid">
          {videos.map((v) => <VideoCard key={v.id} item={v} />)}
        </div>

        {loading && videos.length === 0 && (
          <div className="browse-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="video-card skeleton-card" />
            ))}
          </div>
        )}

        {page < pages && !loading && (
          <div className="browse-more">
            <button className="btn btn-ghost" onClick={loadMore}>Load More</button>
          </div>
        )}
        {loading && videos.length > 0 && (
          <div className="browse-more"><div className="spinner" /></div>
        )}
      </div>
    </div>
  )
}
