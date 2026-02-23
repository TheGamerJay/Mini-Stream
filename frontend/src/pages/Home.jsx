import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HeroBanner from '../components/HeroBanner'
import HorizontalRow from '../components/HorizontalRow'
import VideoCard from '../components/VideoCard'
import { useAuth } from '../context/AuthContext'
import { getHomeData, search as searchApi } from '../api'
import './Home.css'

const GENRES = ['Anime', 'Action', 'Fantasy', 'Romance', 'Horror', 'Slice of Life', 'Sci-Fi', 'Mystery', 'Drama', 'Comedy']

export default function Home() {
  const { user } = useAuth()
  const [homeData, setHomeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeGenre, setActiveGenre] = useState(searchParams.get('genre') || '')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    getHomeData()
      .then(({ data }) => setHomeData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const doSearch = async (q, genre) => {
    if (!q && !genre) { setSearchResults(null); return }
    setSearching(true)
    try {
      const { data } = await searchApi({ q, genre })
      setSearchResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (activeGenre) params.genre = activeGenre
    setSearchParams(params)
    doSearch(searchQuery, activeGenre)
  }

  const handleGenre = (genre) => {
    const newGenre = activeGenre === genre ? '' : genre
    setActiveGenre(newGenre)
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (newGenre) params.genre = newGenre
    setSearchParams(params)
    doSearch(searchQuery, newGenre)
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="home-page">
      {!user && (
        <div className="home-guest-notice">
          Browsing is available to all users. Viewing content requires an account.{' '}
          <Link to="/signup">Create a free account</Link> or <Link to="/login">sign in</Link>.
        </div>
      )}
      {!searchResults && homeData?.featured && (
        <HeroBanner featured={homeData.featured} />
      )}

      <div className="home-content container">
        {/* Search + Genre filter */}
        <div className="home-search">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search titles, creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </form>
          <div className="genre-filter">
            {GENRES.map((g) => (
              <button
                key={g}
                className={`genre-pill${activeGenre === g ? ' active' : ''}`}
                onClick={() => handleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResults ? (
          <div className="search-results fade-in">
            <div className="search-results__header">
              <h2>Results {searchQuery && `for "${searchQuery}"`} {activeGenre && `· ${activeGenre}`}</h2>
              <button className="btn btn-ghost" onClick={() => { setSearchResults(null); setSearchQuery(''); setActiveGenre(''); setSearchParams({}); }}>
                Clear
              </button>
            </div>
            {searching && <div className="page-loader"><div className="spinner" /></div>}
            {!searching && searchResults.series?.length > 0 && (
              <div className="search-section">
                <h3>Series</h3>
                <div className="search-grid">
                  {searchResults.series.map((s) => <VideoCard key={s.id} item={s} type="series" />)}
                </div>
              </div>
            )}
            {!searching && searchResults.videos?.length > 0 && (
              <div className="search-section">
                <h3>Videos</h3>
                <div className="search-grid">
                  {searchResults.videos.map((v) => <VideoCard key={v.id} item={v} type="video" />)}
                </div>
              </div>
            )}
            {!searching && !searchResults.videos?.length && !searchResults.series?.length && (
              <div className="empty-state">
                <p>No results found. Try a different search.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="home-rows fade-in">
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
