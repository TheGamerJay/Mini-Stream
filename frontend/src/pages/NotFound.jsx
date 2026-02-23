import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NotFound.css'

export default function NotFound() {
  const { user } = useAuth()
  return (
    <div className="notfound-page">
      <div className="notfound-glow notfound-glow--cyan" />
      <div className="notfound-glow notfound-glow--violet" />
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-sub">This page doesn't exist or was moved.</p>
        <div className="notfound-actions">
          <Link to={user ? '/home' : '/'} className="btn btn-primary">
            {user ? 'Back to Discover' : 'Back to Home'}
          </Link>
          {user && (
            <Link to="/browse" className="btn btn-ghost">Browse Videos</Link>
          )}
        </div>
      </div>
    </div>
  )
}
