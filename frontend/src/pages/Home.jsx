import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HeroBanner from '../components/HeroBanner'
import HorizontalRow from '../components/HorizontalRow'
import VideoCard from '../components/VideoCard'
import { useAuth } from '../context/AuthContext'
import { getHomeData, browseVideos, getContinueWatching } from '../api'
import './Home.css'

const GENRES = [
  'Anime','Action','Adventure','Comedy','Drama','Fantasy','Romance',
  'Horror','Supernatural','Thriller','Sci-Fi','Mystery','Psychological',
  'Slice of Life','Mecha','Isekai','Historical','Seinen','Shojo','Shonen','Experimental',
]
const RATINGS = ['G', 'PG', 'PG-13', 'R', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'NR']

export default function Home() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [homeData, setHomeData] = useState(null)
  const [loadingHome, setLoadingHome] = useState(true)

  // Filters
  const [activeGenre, setActiveGenre] = useState(searchParams.get('genre') || '')
  const [activeRating, setActiveRating] = useState(searchParams.get('rating') || '')
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [submittedQ, setSubmittedQ] = useState(searchParams.get('q') || '')

  const [continueWatching, setContinueWatching] = useState([])

  // Browse grid
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loadingBrowse, setLoadingBrowse] = useState(false)

  const isFiltered = !!activeGenre || !!activeRating || !!submittedQ

  useEffect(() => {
    getHomeData()
      .then(({ data }) => setHomeData(data))
      .catch(console.error)
      .finally(() => setLoadingHome(false))
  }, [])

  useEffect(() => {
    if (user) {
      getContinueWatching()
        .then(({ data }) => setContinueWatching(data.continue_watching))
        .catch(() => {})
    }
  }, [user])

  const fetchBrowse = useCallback(async (p, genre, rating, query) => {
    setLoadingBrowse(true)
    try {
      const params = { page: p }
      if (genre) params.genre = genre
      if (rating) params.rating = rating
      if (query) params.q = query
      const { data } = await browseVideos(params)
      if (p === 1) setVideos(data.videos)
      else setVideos((prev) => [...prev, ...data.videos])
      setPage(data.page)
      setPages(data.pages)
      setTotal(data.total)
    } catch { /* ignore */ } finally {
      setLoadingBrowse(false)
    }
  }, [])

  useEffect(() => {
    if (isFiltered) fetchBrowse(1, activeGenre, activeRating, submittedQ)
    else setVideos([])
  }, [activeGenre, activeRating, submittedQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const buildParams = (genre, rating, query) => {
    const p = {}
    if (genre) p.genre = genre
    if (rating) p.rating = rating
    if (query) p.q = query
    return p
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSubmittedQ(q)
    setSearchParams(buildParams(activeGenre, activeRating, q))
  }

  const handleGenre = (genre) => {
    const next = activeGenre === genre ? '' : genre
    setActiveGenre(next)
    setSearchParams(buildParams(next, activeRating, submittedQ))
  }

  const handleRating = (rating) => {
    const next = activeRating === rating ? '' : rating
    setActiveRating(next)
    setSearchParams(buildParams(activeGenre, next, submittedQ))
  }

  const clearAll = () => {
    setActiveGenre('')
    setActiveRating('')
    setQ('')
    setSubmittedQ('')
    setSearchParams({})
  }

  const selectAll = () => {
    setActiveGenre('')
    setSearchParams(buildParams('', activeRating, submittedQ))
  }

  if (loadingHome && !homeData && !isFiltered) {
    return <div className="page-loader"><div className="spinner" /></div>
  }

  return (
    <div className="home-page">
      {!user && (
        <div className="home-guest-notice">
          Browsing is available to all. Viewing content requires an account.{' '}
          <Link to="/signup">Sign up free</Link> or <Link to="/login">sign in</Link>.
        </div>
      )}

      {/* Hero — only when not filtering */}
      {!isFiltered && homeData?.featured && <HeroBanner featured={homeData.featured} />}

      <div className="home-content container">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="home-search-bar">
          <input
            type="text"
            className="form-input home-search-input"
            placeholder="Search titles, creators…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {isFiltered && (
            <button type="button" className="btn btn-ghost" onClick={clearAll}>Clear</button>
          )}
        </form>

        {/* Genre tab strip */}
        <div className="genre-tabs-wrap">
          <div className="genre-tabs">
            <button
              className={`genre-tab${!activeGenre ? ' active' : ''}`}
              onClick={selectAll}
            >
              All
            </button>
            {GENRES.map((g) => (
              <button
                key={g}
                className={`genre-tab${activeGenre === g ? ' active' : ''}`}
                onClick={() => handleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Rating filter strip */}
        <div className="rating-tabs-wrap">
          <span className="rating-tabs-label">Rating:</span>
          <div className="rating-tabs">
            {RATINGS.map((r) => (
              <button
                key={r}
                className={`rating-tab${activeRating === r ? ' active' : ''}`}
                onClick={() => handleRating(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Result count when filtered */}
        {isFiltered && !loadingBrowse && (
          <p className="home-results-count">
            {total === 0
              ? 'No videos found.'
              : `${total.toLocaleString()} video${total !== 1 ? 's' : ''}`}
            {activeGenre && ` in ${activeGenre}`}
            {activeRating && ` · ${activeRating}`}
            {submittedQ && ` · "${submittedQ}"`}
          </p>
        )}

        {/* Filtered → grid */}
        {isFiltered ? (
          <>
            <div className="home-grid">
              {loadingBrowse && videos.length === 0
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="home-skeleton" />
                  ))
                : videos.map((v) => <VideoCard key={v.id} item={v} />)
              }
            </div>
            {page < pages && !loadingBrowse && (
              <div className="home-load-more">
                <button className="btn btn-ghost" onClick={() => fetchBrowse(page + 1, activeGenre, activeRating, submittedQ)}>
                  Load More
                </button>
              </div>
            )}
            {loadingBrowse && videos.length > 0 && (
              <div className="home-load-more"><div className="spinner" /></div>
            )}
          </>
        ) : (
          /* Default → curated horizontal rows */
          <div className="home-rows fade-in">
            {continueWatching.length > 0 && (
              <HorizontalRow title="Continue Watching" items={continueWatching} type="video" />
            )}
            <HorizontalRow title="Trending Now" items={homeData?.trending} type="video" />
            <HorizontalRow title="New Episodes" items={homeData?.new_episodes} type="video" />
            <HorizontalRow title="Featured Series" items={homeData?.featured_series} type="series" />
            <HorizontalRow title="Recently Added" items={homeData?.recently_added} type="video" />
            {homeData?.genres && Object.entries(homeData.genres).map(([genre, items]) => (
              <HorizontalRow key={genre} title={genre} items={items} type="video" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
