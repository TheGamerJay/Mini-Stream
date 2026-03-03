import './EmptyState.css'

const ILLUSTRATIONS = {
  watchlater: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
      <path d="M28 20a2 2 0 00-2 2v36l14-7 14 7V22a2 2 0 00-2-2H28z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
      <circle cx="40" cy="42" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none"/>
      <path d="M40 37v6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  history: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
      <circle cx="40" cy="42" r="16" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M40 30v12l7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M26 28l-4-6m0 0l6-2m-6 2l2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
      <circle cx="36" cy="36" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M46 46l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 32h8M32 37h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  playlist: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
      <rect x="22" y="28" width="36" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <rect x="22" y="40" width="28" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35"/>
      <rect x="22" y="52" width="20" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2"/>
    </svg>
  ),
  notifications: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
      <path d="M40 22c-8.8 0-14 7-14 14v8l-4 5h36l-4-5V36c0-7-5.2-14-14-14z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M36 56a4 4 0 008 0" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
}

export default function EmptyState({ type = 'search', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__illustration">
        {ILLUSTRATIONS[type] || ILLUSTRATIONS.search}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
