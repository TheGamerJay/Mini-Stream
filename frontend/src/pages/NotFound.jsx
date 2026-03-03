import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NotFound.css'

const QUICK_GENRES = ['Anime','Action','Comedy','Horror','Sci-Fi','Romance','Thriller']

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/home?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="notfound-page">
      <div className="notfound-glow notfound-glow--cyan" />
      <div className="notfound-glow notfound-glow--violet" />
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-sub">This page doesn't exist or was moved.</p>

        <form onSubmit={handleSearch} className="notfound-search">
          <input
            className="form-input notfound-search-input"
            placeholder="Search for something to watch…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="notfound-genres">
          {QUICK_GENRES.map((g) => (
            <Link key={g} to={`/home?genre=${encodeURIComponent(g)}`} className="notfound-genre-tag">
              {g}
            </Link>
          ))}
        </div>

        <div className="notfound-actions">
          <Link to={user ? '/home' : '/'} className="btn btn-ghost">
            {user ? 'Back to Discover' : 'Back to Home'}
          </Link>
          {user && (
            <Link to="/browse" className="btn btn-ghost">Browse All</Link>
          )}
        </div>
      </div>
    </div>
  )
}
