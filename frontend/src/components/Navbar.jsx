import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { autocomplete } from '../api'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef(null)
  const acTimerRef = useRef(null)
  const lastY = useRef(0)

  // Close search on navigation
  useEffect(() => {
    setSearchOpen(false)
    setSearchQ('')
    setSuggestions([])
    setShowSuggestions(false)
    setMobileOpen(false)
  }, [location.pathname])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus()
  }, [searchOpen])

  const fetchSuggestions = useCallback((q) => {
    clearTimeout(acTimerRef.current)
    if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    acTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await autocomplete(q)
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } catch { /* ignore */ }
    }, 220)
  }, [])

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQ(q)
    fetchSuggestions(q)
  }

  const pickSuggestion = (s) => {
    setShowSuggestions(false)
    setSuggestions([])
    setSearchOpen(false)
    setSearchQ('')
    if (s.type === 'video') navigate(`/watch/${s.id}`)
    else if (s.type === 'creator') navigate(`/creator/${s.id}`)
    else navigate('/home?q=' + encodeURIComponent(s.label))
  }

  const submitSearch = (e) => {
    e?.preventDefault()
    const q = searchQ.trim()
    setShowSuggestions(false)
    if (!q) { setSearchOpen(false); return }
    navigate('/home?q=' + encodeURIComponent(q))
    setSearchOpen(false)
    setSearchQ('')
  }

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setHidden(y > lastY.current && y > 80)
      lastY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className={`navbar${hidden ? ' navbar--hidden' : ''}`}>
      <div className="navbar__inner container">
        <Link to={user ? '/home' : '/'} className="navbar__logo">
          <img src="/Mini Stream logo.png" alt="MiniStream" className="navbar__logo-img" />
        </Link>

        {user && (
          <nav className="navbar__nav">
            <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Stream</NavLink>
            <NavLink to="/browse" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Browse</NavLink>
            <NavLink to="/watch-later" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Watch Later</NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>
            {user.is_creator && (
              <NavLink to="/creator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            )}
          </nav>
        )}

        <div className="navbar__actions">
          {user ? (
            <>
              {/* Search */}
              <div className={`navbar__search${searchOpen ? ' navbar__search--open' : ''}`}>
                {searchOpen && (
                  <form onSubmit={submitSearch} className="navbar__search-form">
                    <input
                      ref={searchInputRef}
                      className="navbar__search-input"
                      placeholder="Search videos…"
                      value={searchQ}
                      onChange={handleSearchChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      autoComplete="off"
                    />
                    <button type="submit" className="navbar__search-icon" aria-label="Search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </button>
                    <button type="button" className="navbar__search-close" onClick={() => { setSearchOpen(false); setSearchQ(''); setSuggestions([]); setShowSuggestions(false) }}>✕</button>
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="navbar__autocomplete">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            className="navbar__ac-item"
                            onMouseDown={() => pickSuggestion(s)}
                          >
                            <span className="navbar__ac-type">{s.type === 'creator' ? '👤' : '▶'}</span>
                            <span className="navbar__ac-label">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
                )}
                {!searchOpen && (
                  <button className="navbar__search-toggle" onClick={() => setSearchOpen(true)} aria-label="Open search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </button>
                )}
              </div>

              {/* Theme toggle */}
              <button
                className="navbar__theme-toggle"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? '☀' : '🌙'}
              </button>

              {/* Hamburger — mobile only */}
              <button
                className="navbar__hamburger"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <span /><span /><span />
              </button>

              <div className="navbar__user">
                <div className="navbar__avatar" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.display_name} />
                    : <span>{user.display_name.charAt(0).toUpperCase()}</span>}
                </div>
                {menuOpen && (
                  <div className="navbar__dropdown">
                    <div className="dropdown-name">{user.display_name}</div>
                    <div className="dropdown-email">{user.email}</div>
                    <hr />
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="dropdown-item">
                      Profile Settings
                    </Link>
                    {!user.is_creator && (
                      <Link to="/become-creator" onClick={() => setMenuOpen(false)} className="dropdown-item">
                        Become a Creator
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item dropdown-item--danger">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && user && (
        <div className="mobile-drawer">
          <form onSubmit={(e) => { e.preventDefault(); submitSearch() }} className="mobile-search-form">
            <input
              className="mobile-search-input"
              placeholder="Search videos…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <button type="submit" className="navbar__search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          </form>
          <NavLink to="/home" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            Stream
          </NavLink>
          <NavLink to="/browse" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            Browse
          </NavLink>
          <NavLink to="/watch-later" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            Watch Later
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            History
          </NavLink>
          {user.is_creator && (
            <NavLink to="/creator" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/profile" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            Profile Settings
          </NavLink>
          {!user.is_creator && (
            <NavLink to="/become-creator" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              Become a Creator
            </NavLink>
          )}
          <button className="mobile-nav-link mobile-signout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  )
}
