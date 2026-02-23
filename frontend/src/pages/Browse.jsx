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

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [genre, setGenre] = useState(searchParams.get('genre') || '')
  const [language, setLanguage] = useState(searchParams.get('language') || '')
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p }
      if (q) params.q = q
      if (genre) params.genre = genre
      if (language) params.language = language
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
  }, [q, genre, language])

  useEffect(() => {
    setPage(1)
    fetchVideos(1)
    const p = {}
    if (q) p.q = q
    if (genre) p.genre = genre
    if (language) p.language = language
    setSearchParams(p)
  }, [genre, language])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVideos(1)
    const p = {}
    if (q) p.q = q
    if (genre) p.genre = genre
    if (language) p.language = language
    setSearchParams(p)
  }

  const loadMore = () => {
    const next = page + 1
    fetchVideos(next)
  }

  const toggleGenre = (g) => setGenre((prev) => prev === g ? '' : g)
  const toggleLang = (l) => setLanguage((prev) => prev === l ? '' : l)

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

        {/* Genre chips */}
        <div className="browse-filters">
          <div className="filter-row">
            <span className="filter-label">Genre</span>
            <div className="filter-chips">
              {GENRES.map((g) => (
                <button
                  key={g}
                  className={`filter-chip${genre === g ? ' active' : ''}`}
                  onClick={() => toggleGenre(g)}
                  type="button"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">Language</span>
            <div className="filter-chips">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  className={`filter-chip${language === l ? ' active' : ''}`}
                  onClick={() => toggleLang(l)}
                  type="button"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="browse-count">
            {total === 0 ? 'No videos found.' : `${total.toLocaleString()} video${total !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Grid */}
        <div className="browse-grid">
          {videos.map((v) => <VideoCard key={v.id} item={v} />)}
        </div>

        {/* Loading skeleton */}
        {loading && videos.length === 0 && (
          <div className="browse-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="video-card skeleton-card" />
            ))}
          </div>
        )}

        {/* Load more */}
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
