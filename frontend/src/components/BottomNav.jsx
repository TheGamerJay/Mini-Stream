import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './BottomNav.css'

export default function BottomNav() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `bottom-nav__item${isActive ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
          <path d="M9 22V12h6v10"/>
        </svg>
        <span>Stream</span>
      </NavLink>

      <NavLink to="/browse" className={({ isActive }) => `bottom-nav__item${isActive ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>Browse</span>
      </NavLink>

      <button className="bottom-nav__item" onClick={() => navigate('/home?search=1')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>Search</span>
      </button>

      <NavLink to="/watch-later" className={({ isActive }) => `bottom-nav__item${isActive ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z"/>
        </svg>
        <span>My List</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `bottom-nav__item${isActive ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
        </svg>
        <span>Profile</span>
      </NavLink>
    </nav>
  )
}
