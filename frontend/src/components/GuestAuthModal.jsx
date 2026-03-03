import { Link } from 'react-router-dom'
import './GuestAuthModal.css'

export default function GuestAuthModal({ onClose }) {
  return (
    <div className="guest-modal-overlay" onClick={onClose}>
      <div className="guest-modal" onClick={e => e.stopPropagation()}>
        <button className="guest-modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="guest-modal__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
        <h2 className="guest-modal__title">Sign in to Watch</h2>
        <p className="guest-modal__desc">
          Create a free account to access thousands of indie films, series, and anime on MiniStream.
        </p>
        <div className="guest-modal__actions">
          <Link to="/login" className="btn btn-primary guest-modal__btn">Sign In</Link>
          <Link to="/signup" className="btn btn-ghost guest-modal__btn">Create Free Account</Link>
        </div>
      </div>
    </div>
  )
}
