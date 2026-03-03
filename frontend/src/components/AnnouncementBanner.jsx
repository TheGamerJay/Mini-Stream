import { useState, useEffect } from 'react'
import { getAnnouncement } from '../api'
import './AnnouncementBanner.css'

export default function AnnouncementBanner() {
  const [ann, setAnn] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    getAnnouncement()
      .then(({ data }) => {
        if (data.announcement) {
          const key = `ann-dismissed-${data.announcement.id}`
          if (!sessionStorage.getItem(key)) setAnn(data.announcement)
        }
      })
      .catch(() => {})
  }, [])

  if (!ann || dismissed) return null

  const dismiss = () => {
    sessionStorage.setItem(`ann-dismissed-${ann.id}`, '1')
    setDismissed(true)
  }

  return (
    <div className={`ann-banner ann-banner--${ann.type || 'info'}`}>
      <span className="ann-banner__msg">{ann.message}</span>
      <button className="ann-banner__close" onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  )
}
