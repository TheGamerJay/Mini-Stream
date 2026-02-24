import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  updateProfile, uploadAvatar, changePassword as apiChangePassword,
  deleteAccount, clearHistory,
} from '../api'
import './Profile.css'

const GENRES = [
  'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
  'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
  'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen', 'Experimental',
]

const PREF_DEFAULTS = { autoplay: true, quality: 'auto', dub_sub: 'sub', mature_content: false, genres: [] }

function getPrefs() {
  try { return { ...PREF_DEFAULTS, ...JSON.parse(localStorage.getItem('ms_prefs') || '{}') } }
  catch { return { ...PREF_DEFAULTS } }
}
function savePrefs(p) { localStorage.setItem('ms_prefs', JSON.stringify(p)) }

export default function Profile() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ display_name: '', bio: '', location: '', website: '' })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const [clearingHistory, setClearingHistory] = useState(false)
  const [historyCleared, setHistoryCleared] = useState(false)

  const [prefs, setPrefs] = useState(getPrefs)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      })
    }
  }, [user])

  const setPref = (key, val) => {
    const next = { ...prefs, [key]: val }
    setPrefs(next)
    savePrefs(next)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    setAvatarError('')
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      await uploadAvatar(fd)
      await refreshUser()
    } catch {
      setAvatarError('Upload failed. Try a smaller image.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setSaveSuccess(false); setSaveError('')
    try {
      await updateProfile(form)
      await refreshUser()
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err?.response?.data?.error || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handlePwChange = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    setPwSaving(true); setPwSuccess(false)
    try {
      await apiChangePassword({ current_password: pwForm.current, new_password: pwForm.next })
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err?.response?.data?.error || 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  const handleClearHistory = async () => {
    setClearingHistory(true)
    try {
      await clearHistory()
      setHistoryCleared(true)
    } catch { /* ignore */ } finally {
      setClearingHistory(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user.email) return
    setDeleting(true)
    try {
      await deleteAccount()
      logout()
      navigate('/')
    } catch { setDeleting(false) }
  }

  if (!user) return null

  const avatarSrc = avatarPreview || user.avatar_url

  return (
    <div className="profile-page">
      <div className="profile-wrap container">
        <h1 className="profile-page-title">Settings</h1>

        {/* ── ACCOUNT ── */}
        <section className="profile-section">
          <h2 className="profile-section-heading">Account</h2>
          <div className="profile-card">
            <div className="profile-avatar-row">
              <div
                className={`profile-avatar profile-avatar--editable${avatarUploading ? ' profile-avatar--loading' : ''}`}
                onClick={() => !avatarUploading && fileInputRef.current.click()}
                title="Change avatar"
              >
                {avatarSrc
                  ? <img src={avatarSrc} alt={user.display_name} />
                  : <span>{user.display_name.charAt(0).toUpperCase()}</span>}
                <div className="profile-avatar-overlay">
                  {avatarUploading
                    ? <div className="profile-avatar-spinner" />
                    : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <div className="profile-meta">
                <p className="profile-name">{user.display_name}</p>
                <p className="profile-email">{user.email}</p>
                <p className="profile-joined">
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                {user.is_creator && <span className="profile-creator-badge">✦ Creator</span>}
                {avatarError && <p className="profile-avatar-error">{avatarError}</p>}
              </div>
            </div>

            {saveSuccess && <div className="profile-success">Changes saved.</div>}
            {saveError && <div className="profile-error">{saveError}</div>}

            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-field">
                <label>Display Name</label>
                <input type="text" value={form.display_name} maxLength={100} required
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
              </div>
              <div className="profile-field">
                <label>Bio <span className="profile-optional">(optional)</span></label>
                <textarea value={form.bio} maxLength={500} rows={3}
                  placeholder="Tell viewers a bit about yourself…"
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                <span className="profile-char-count">{form.bio.length}/500</span>
              </div>
              <div className="profile-field-row">
                <div className="profile-field">
                  <label>Location <span className="profile-optional">(optional)</span></label>
                  <input type="text" value={form.location} maxLength={100} placeholder="City, Country"
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="profile-field">
                  <label>Website <span className="profile-optional">(optional)</span></label>
                  <input type="url" value={form.website} maxLength={255} placeholder="https://…"
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                </div>
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
        </section>

        {/* ── WATCH EXPERIENCE ── */}
        <section className="profile-section">
          <h2 className="profile-section-heading">Watch Experience</h2>
          <div className="profile-card profile-card--flush">
            <Link to="/home" className="profile-watch-link">
              <span className="pwl-icon">▶</span>
              <div><p className="pwl-title">Continue Watching</p><p className="pwl-sub">Resume in-progress videos</p></div>
              <span className="pwl-chevron">›</span>
            </Link>
            <Link to="/watch-later" className="profile-watch-link">
              <span className="pwl-icon">🔖</span>
              <div><p className="pwl-title">My List</p><p className="pwl-sub">Saved videos and series</p></div>
              <span className="pwl-chevron">›</span>
            </Link>
            <Link to="/history" className="profile-watch-link">
              <span className="pwl-icon">🕐</span>
              <div><p className="pwl-title">Watch History</p><p className="pwl-sub">Everything you've watched</p></div>
              <span className="pwl-chevron">›</span>
            </Link>
            <div className="profile-clear-row">
              {historyCleared
                ? <p className="profile-hint profile-hint--green">Watch history cleared.</p>
                : (
                  <button className="btn btn-ghost profile-danger-ghost" disabled={clearingHistory} onClick={handleClearHistory}>
                    {clearingHistory ? 'Clearing…' : 'Clear Watch History'}
                  </button>
                )}
            </div>
          </div>
        </section>

        {/* ── PREFERENCES ── */}
        <section className="profile-section">
          <h2 className="profile-section-heading">Playback & Preferences</h2>
          <div className="profile-card">
            <div className="profile-pref-list">

              <div className="profile-pref-row">
                <div>
                  <p className="profile-pref-label">Autoplay Next Episode</p>
                  <p className="profile-pref-sub">Automatically play the next episode when one ends</p>
                </div>
                <button className={`profile-toggle${prefs.autoplay ? ' profile-toggle--on' : ''}`}
                  onClick={() => setPref('autoplay', !prefs.autoplay)}>
                  <span className="profile-toggle-knob" />
                </button>
              </div>

              <div className="profile-pref-row">
                <div>
                  <p className="profile-pref-label">Dub / Sub Preference</p>
                  <p className="profile-pref-sub">Default audio and subtitle mode</p>
                </div>
                <div className="profile-seg">
                  {['sub', 'dub'].map(v => (
                    <button key={v} className={`profile-seg-btn${prefs.dub_sub === v ? ' active' : ''}`}
                      onClick={() => setPref('dub_sub', v)}>
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-pref-row">
                <div><p className="profile-pref-label">Default Quality</p></div>
                <select className="profile-select" value={prefs.quality} onChange={e => setPref('quality', e.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
              </div>

              <div className="profile-pref-row profile-pref-row--last">
                <div>
                  <p className="profile-pref-label">Mature Content</p>
                  <p className="profile-pref-sub">Show TV-MA and R-rated content</p>
                </div>
                <button className={`profile-toggle${prefs.mature_content ? ' profile-toggle--on' : ''}`}
                  onClick={() => setPref('mature_content', !prefs.mature_content)}>
                  <span className="profile-toggle-knob" />
                </button>
              </div>

            </div>

            <div className="profile-genres-section">
              <p className="profile-pref-label">Preferred Genres</p>
              <p className="profile-pref-sub" style={{ marginBottom: 12 }}>Personalize your recommendations</p>
              <div className="profile-genres-grid">
                {GENRES.map(g => (
                  <button key={g}
                    className={`profile-genre-chip${prefs.genres.includes(g) ? ' active' : ''}`}
                    onClick={() => setPref('genres', prefs.genres.includes(g)
                      ? prefs.genres.filter(x => x !== g)
                      : [...prefs.genres, g])}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CREATOR ── */}
        <section className="profile-section">
          <h2 className="profile-section-heading">Creator</h2>
          <div className="profile-card">
            {user.is_creator ? (
              <div className="profile-creator-row">
                <div>
                  <p className="profile-pref-label">
                    Creator Mode Active&nbsp;
                    <span className="profile-creator-badge" style={{ marginLeft: 6 }}>✦ Creator</span>
                  </p>
                  <p className="profile-pref-sub">Upload videos, manage series, and track your analytics</p>
                </div>
                <Link to="/creator" className="btn btn-primary">Creator Dashboard</Link>
              </div>
            ) : (
              <div className="profile-creator-row">
                <div>
                  <p className="profile-pref-label">Enable Creator Mode</p>
                  <p className="profile-pref-sub">Share your stories with the world. Upload videos, build series, and track views.</p>
                </div>
                <Link to="/become-creator" className="btn btn-ghost">Become a Creator</Link>
              </div>
            )}
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section className="profile-section">
          <h2 className="profile-section-heading">Security</h2>

          {user.has_password && (
            <div className="profile-card" style={{ marginBottom: 16 }}>
              <h3 className="profile-card-subtitle">Change Password</h3>
              {pwSuccess && <div className="profile-success">Password updated successfully.</div>}
              {pwError && <div className="profile-error">{pwError}</div>}
              <form onSubmit={handlePwChange} className="profile-form">
                <div className="profile-field">
                  <label>Current Password</label>
                  <input type="password" value={pwForm.current} required autoComplete="current-password"
                    onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
                </div>
                <div className="profile-field-row">
                  <div className="profile-field">
                    <label>New Password</label>
                    <input type="password" value={pwForm.next} minLength={8} required autoComplete="new-password"
                      onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
                  </div>
                  <div className="profile-field">
                    <label>Confirm New Password</label>
                    <input type="password" value={pwForm.confirm} minLength={8} required autoComplete="new-password"
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary profile-save" disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          <div className="profile-card profile-card--danger">
            <h3 className="profile-card-subtitle profile-card-subtitle--danger">Danger Zone</h3>
            {!deleteOpen ? (
              <div className="profile-danger-row">
                <div>
                  <p className="profile-pref-label">Delete Account</p>
                  <p className="profile-pref-sub">Permanently deletes your account and all data. This cannot be undone.</p>
                </div>
                <button className="btn profile-delete-btn" onClick={() => setDeleteOpen(true)}>Delete Account</button>
              </div>
            ) : (
              <div className="profile-delete-confirm">
                <p className="profile-pref-sub">Type your email address to confirm:</p>
                <input type="email" className="profile-delete-input"
                  value={deleteEmail} placeholder={user.email}
                  onChange={e => setDeleteEmail(e.target.value)} />
                <div className="profile-delete-actions">
                  <button className="btn btn-ghost" onClick={() => { setDeleteOpen(false); setDeleteEmail('') }}>Cancel</button>
                  <button className="btn profile-delete-btn"
                    disabled={deleteEmail !== user.email || deleting}
                    onClick={handleDeleteAccount}>
                    {deleting ? 'Deleting…' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
