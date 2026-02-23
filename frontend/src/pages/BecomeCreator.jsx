import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { becomeCreator } from '../api'
import './BecomeCreator.css'

export default function BecomeCreator() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) return (
    <div className="bc-page container">
      <p>Please <Link to="/login" className="link-cyan">sign in</Link> to continue.</p>
    </div>
  )

  if (user.is_creator) {
    navigate('/creator')
    return null
  }

  const handleActivate = async () => {
    setError('')
    setLoading(true)
    try {
      await becomeCreator()
      await refreshUser()
      navigate('/creator')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bc-page">
      <div className="container bc-inner">
        <div className="bc-card">
          <div className="bc-glow" />
          <div className="bc-content">
            <span className="tag tag-cyan bc-tag">Creator Program</span>
            <h1>Share Your Story with the World</h1>
            <p>
              Activate your Creator account to upload original videos and series.
              MiniStream is built for indie storytellers — anime-style, animated shorts,
              visual narratives, and more.
            </p>
            <div className="bc-perks">
              <div className="bc-perk">Upload original videos and series</div>
              <div className="bc-perk">Organize episodes by season</div>
              <div className="bc-perk">Track views privately</div>
              <div className="bc-perk">No ads. No algorithm noise.</div>
            </div>
            <div className="bc-rules">
              <p>
                By activating, you agree to our{' '}
                <Link to="/content-rules">Content Rules</Link> and confirm you will only upload
                content you own the rights to.
              </p>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary bc-btn" onClick={handleActivate} disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : 'Activate Creator Account — Free'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
