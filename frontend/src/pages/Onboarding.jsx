import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../api'
import { useAuth } from '../context/AuthContext'
import './Onboarding.css'

const GENRES = [
  'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
  'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
  'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen',
  'Experimental',
]

export default function Onboarding() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const toggle = (g) =>
    setSelected((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    )

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await completeOnboarding(selected)
      if (refreshUser) await refreshUser()
      navigate('/home')
    } catch {
      navigate('/home')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1 className="onboarding-title">What do you love watching?</h1>
        <p className="onboarding-sub">
          Pick your favourite genres. We'll personalise your feed.
        </p>

        <div className="onboarding-genres">
          {GENRES.map((g) => (
            <button
              key={g}
              className={`onboarding-genre-btn${selected.includes(g) ? ' selected' : ''}`}
              onClick={() => toggle(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="onboarding-actions">
          <button
            className="btn btn-primary onboarding-continue"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving…' : selected.length === 0 ? 'Skip for now' : `Continue with ${selected.length} genre${selected.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
