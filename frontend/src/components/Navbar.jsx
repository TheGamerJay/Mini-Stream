import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

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
            <NavLink to="/watch-later" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Watch Later</NavLink>
            {user.is_creator && (
              <NavLink to="/creator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            )}
          </nav>
        )}

        <div className="navbar__actions">
          {user ? (
            <>
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
          <NavLink to="/home" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            Stream
          </NavLink>
          <NavLink to="/watch-later" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            Watch Later
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
