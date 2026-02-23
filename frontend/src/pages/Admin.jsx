import { useState, useEffect, useCallback } from 'react'
import './Admin.css'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/admin` : '/api/admin'
const ADMIN_EMAIL = 'ministream.help@gmail.com'
const ADMIN_PASS = 'Yariel@13'

function adminFetch(path, token, opts = {}) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
      ...(opts.headers || {}),
    },
  }).then((r) => r.json())
}

// ── Login screen ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
      } else {
        sessionStorage.setItem('admin_token', data.token)
        onLogin(data.token)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <h1>MiniStream Admin</h1>
          <p className="admin-sub">Platform monitoring — restricted access</p>
          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>
            <div className="admin-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="admin-login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            {error && <p className="admin-login-error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ token }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminFetch('/stats', token).then(setStats)
  }, [token])

  if (!stats) return <div className="admin-loading">Loading…</div>

  return (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.total_users}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Creators</div>
          <div className="stat-value cyan">{stats.total_creators}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Total Videos</div>
          <div className="stat-value">{stats.total_videos}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Published Videos</div>
          <div className="stat-value purple">{stats.total_published_videos}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Series</div>
          <div className="stat-value">{stats.total_series}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Total Views</div>
          <div className="stat-value cyan">{stats.total_views.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-section-title">Recent Sign-ups</div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Display Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_signups.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.display_name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`admin-badge ${u.is_creator ? 'creator' : 'user'}`}>
                    {u.is_creator ? 'Creator' : 'Viewer'}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Users tab ─────────────────────────────────────────────────────────────────
function UsersTab({ token }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page })
    if (query) params.set('search', query)
    adminFetch(`/users?${params}`, token).then(setData)
  }, [token, page, query])

  useEffect(() => { load() }, [load])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await adminFetch(`/users/${id}`, token, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="admin-search-row">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="admin-search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-page-btn" type="submit">Search</button>
        </form>
        {data && <span className="admin-count">{data.total} users</span>}
      </div>

      {!data ? (
        <div className="admin-loading">Loading…</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Display Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Videos</th>
                  <th>Auth</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.display_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.is_creator ? 'creator' : 'user'}`}>
                        {u.is_creator ? 'Creator' : 'Viewer'}
                      </span>
                    </td>
                    <td>{u.video_count}</td>
                    <td>{u.google_id ? 'Google' : 'Email'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-del-btn" onClick={() => deleteUser(u.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="admin-page-info">Page {page} / {data.pages}</span>
              <button
                className="admin-page-btn"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Videos tab ────────────────────────────────────────────────────────────────
function VideosTab({ token }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page })
    if (query) params.set('search', query)
    adminFetch(`/videos?${params}`, token).then(setData)
  }, [token, page, query])

  useEffect(() => { load() }, [load])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  async function deleteVideo(id) {
    if (!confirm('Delete this video?')) return
    await adminFetch(`/videos/${id}`, token, { method: 'DELETE' })
    load()
  }

  function fmtDuration(s) {
    if (!s) return '—'
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}m ${sec}s`
  }

  return (
    <div>
      <div className="admin-search-row">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="admin-search-input"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-page-btn" type="submit">Search</button>
        </form>
        {data && <span className="admin-count">{data.total} videos</span>}
      </div>

      {!data ? (
        <div className="admin-loading">Loading…</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Genre</th>
                  <th>Type</th>
                  <th>Rating</th>
                  <th>Duration</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.videos.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</td>
                    <td>{v.creator_name || '—'}</td>
                    <td>{v.genre}</td>
                    <td>{v.video_type}</td>
                    <td>
                      {v.content_rating === 'Mature' ? (
                        <span className="admin-badge mature">Mature</span>
                      ) : v.content_rating}
                    </td>
                    <td>{fmtDuration(v.duration)}</td>
                    <td>{v.view_count.toLocaleString()}</td>
                    <td>
                      <span className={`admin-badge ${v.is_published ? 'published' : 'draft'}`}>
                        {v.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td>{new Date(v.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-del-btn" onClick={() => deleteVideo(v.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="admin-page-info">Page {page} / {data.pages}</span>
              <button
                className="admin-page-btn"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Series tab ────────────────────────────────────────────────────────────────
function SeriesTab({ token }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page })
    if (query) params.set('search', query)
    adminFetch(`/series?${params}`, token).then(setData)
  }, [token, page, query])

  useEffect(() => { load() }, [load])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  return (
    <div>
      <div className="admin-search-row">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="admin-search-input"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-page-btn" type="submit">Search</button>
        </form>
        {data && <span className="admin-count">{data.total} series</span>}
      </div>

      {!data ? (
        <div className="admin-loading">Loading…</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Genre</th>
                  <th>Rating</th>
                  <th>Episodes</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.series.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.title}</td>
                    <td>{s.creator_name || '—'}</td>
                    <td>{s.genre}</td>
                    <td>
                      {s.content_rating === 'Mature' ? (
                        <span className="admin-badge mature">Mature</span>
                      ) : s.content_rating}
                    </td>
                    <td>{s.episode_count}</td>
                    <td>
                      <span className={`admin-badge ${s.is_published ? 'published' : 'draft'}`}>
                        {s.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="admin-page-info">Page {page} / {data.pages}</span>
              <button
                className="admin-page-btn"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Users', 'Videos', 'Series']

function AdminDashboard({ token, onLogout }) {
  const [tab, setTab] = useState('Overview')

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-header">
        <h1>MiniStream Admin</h1>
        <button className="admin-logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="admin-body">
        {tab === 'Overview' && <OverviewTab token={token} />}
        {tab === 'Users' && <UsersTab token={token} />}
        {tab === 'Videos' && <VideosTab token={token} />}
        {tab === 'Series' && <SeriesTab token={token} />}
      </div>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || null)

  function handleLogin(t) { setToken(t) }
  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    setToken(null)
  }

  if (!token) return <AdminLogin onLogin={handleLogin} />
  return <AdminDashboard token={token} onLogout={handleLogout} />
}
