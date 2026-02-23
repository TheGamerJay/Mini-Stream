import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HeroBanner from '../components/HeroBanner'
import HorizontalRow from '../components/HorizontalRow'
import VideoCard from '../components/VideoCard'
import { useAuth } from '../context/AuthContext'
import { getHomeData, search as searchApi } from '../api'
import './Home.css'

const GENRES = [
  'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
  'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
  'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen',
  'Experimental',
]
const LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Japanese']

export default function Home() {
  const { user } = useAuth()
  const [homeData, setHomeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeGenre, setActiveGenre] = useState(searchParams.get('genre') || '')
  const [activeLanguage, setActiveLanguage] = useState(searchParams.get('language') || '')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    getHomeData()
      .then(({ data }) => setHomeData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const doSearch = async (q, genre, language) => {
    if (!q && !genre && !language) { setSearchResults(null); return }
    setSearching(true)
    try {
      const { data } = await searchApi({ q, genre, language })
      setSearchResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const buildParams = (q, genre, language) => {
    const p = {}
    if (q) p.q = q
    if (genre) p.genre = genre
    if (language) p.language = language
    return p
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = buildParams(searchQuery, activeGenre, activeLanguage)
    setSearchParams(params)
    doSearch(searchQuery, activeGenre, activeLanguage)
  }

  const handleGenre = (genre) => {
    const newGenre = activeGenre === genre ? '' : genre
    setActiveGenre(newGenre)
    setSearchParams(buildParams(searchQuery, newGenre, activeLanguage))
    doSearch(searchQuery, newGenre, activeLanguage)
  }

  const handleLanguage = (lang) => {
    const newLang = activeLanguage === lang ? '' : lang
    setActiveLanguage(newLang)
    setSearchParams(buildParams(searchQuery, activeGenre, newLang))
    doSearch(searchQuery, activeGenre, newLang)
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
          <div className="language-filter">
            <span className="filter-label">Language:</span>
            {LANGUAGES.map((l) => (
              <button
                key={l}
                className={`genre-pill${activeLanguage === l ? ' active' : ''}`}
                onClick={() => handleLanguage(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResults ? (
          <div className="search-results fade-in">
            <div className="search-results__header">
              <h2>Results {searchQuery && `for "${searchQuery}"`} {activeGenre && `· ${activeGenre}`}</h2>
              <button className="btn btn-ghost" onClick={() => { setSearchResults(null); setSearchQuery(''); setActiveGenre(''); setActiveLanguage(''); setSearchParams({}); }}>
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
