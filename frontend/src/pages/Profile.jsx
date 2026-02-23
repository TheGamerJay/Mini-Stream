import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api'
import './Profile.css'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      await updateProfile(form)
      await refreshUser()
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="profile-page">
      <div className="container profile-inner">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar_url
              ? <img src={user.avatar_url} alt={user.display_name} />
              : <span>{user.display_name.charAt(0).toUpperCase()}</span>}
          </div>
          <div>
            <h1 className="profile-name">{user.display_name}</h1>
            <p className="profile-email">{user.email}</p>
            {user.is_creator && <span className="profile-creator-badge">✦ Creator</span>}
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-section-title">Profile Settings</h2>
          {success && <div className="profile-success">Changes saved successfully.</div>}
          {error && <div className="profile-error">{error}</div>}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-field">
              <label>Display Name</label>
              <input
                type="text"
                value={form.display_name}
                onChange={set('display_name')}
                maxLength={100}
                required
                placeholder="Your display name"
              />
            </div>
            <div className="profile-field">
              <label>Bio <span className="profile-optional">(optional)</span></label>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                maxLength={500}
                rows={4}
                placeholder="Tell viewers a bit about yourself or your content..."
              />
              <span className="profile-char-count">{form.bio.length}/500</span>
            </div>
            <div className="profile-field profile-field--readonly">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
              <span className="profile-hint">Email cannot be changed.</span>
            </div>
            <button type="submit" className="btn btn-primary profile-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
