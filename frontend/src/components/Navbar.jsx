import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to={user ? '/home' : '/'} className="navbar__logo">
          Mini<span className="gradient-text">Stream</span>
        </Link>

        {user && (
          <nav className="navbar__nav">
            <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Discover</NavLink>
            <NavLink to="/watch-later" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Watch Later</NavLink>
            {user.is_creator && (
              <NavLink to="/creator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            )}
          </nav>
        )}

        <div className="navbar__actions">
          {user ? (
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
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
