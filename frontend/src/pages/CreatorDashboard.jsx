import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getStats, getMyVideos, getMySeries,
  uploadVideo, createSeries, updateVideo, deleteVideo,
} from '../api'
import './CreatorDashboard.css'

const GENRES = [
  'Anime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance',
  'Horror', 'Supernatural', 'Thriller', 'Sci-Fi', 'Mystery', 'Psychological',
  'Slice of Life', 'Mecha', 'Isekai', 'Historical', 'Seinen', 'Shojo', 'Shonen',
  'Experimental',
]
const LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Japanese']
const VIDEO_TYPES = ['Standalone', 'Episode', 'Short / Clip', 'Trailer / Teaser', 'Announcement']
const RATINGS = ['General', 'Mature']

function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-value">{stats.total_videos}</span>
        <span className="stat-label">Videos</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{Number(stats.total_views).toLocaleString()}</span>
        <span className="stat-label">Total Views</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.total_series}</span>
        <span className="stat-label">Series</span>
      </div>
    </div>
  )
}

function UploadForm({ seriesList, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', genre: GENRES[0], language: LANGUAGES[0],
    video_type: VIDEO_TYPES[0], content_rating: RATINGS[0],
    series_id: '', episode_number: '', season_number: '1',
  })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) { setError('Please select a video file.'); return }
    setError('')
    setUploading(true)
    setProgress('Uploading video...')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    fd.append('video', videoFile)
    if (thumbFile) fd.append('thumbnail', thumbFile)
    try {
      await uploadVideo(fd)
      setProgress('')
      onSuccess()
      setForm({ title: '', description: '', genre: GENRES[0], language: LANGUAGES[0], video_type: VIDEO_TYPES[0], content_rating: RATINGS[0], series_id: '', episode_number: '', season_number: '1' })
      setVideoFile(null)
      setThumbFile(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.')
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      {error && <div className="auth-error">{error}</div>}
      {progress && <div className="upload-progress">{progress}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Episode or video title" />
        </div>
        <div className="form-group">
          <label className="form-label">Genre *</label>
          <select className="form-input" value={form.genre} onChange={e => set('genre', e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Language *</label>
          <select className="form-input" value={form.language} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Video Type *</label>
          <select className="form-input" value={form.video_type} onChange={e => {
            set('video_type', e.target.value)
            if (e.target.value !== 'Episode') set('series_id', '')
          }}>
            {VIDEO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Content Rating *</label>
          <select className="form-input" value={form.content_rating} onChange={e => set('content_rating', e.target.value)}>
            {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe this video..." rows={3} required />
      </div>

      {form.video_type === 'Episode' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Series *</label>
            <select className="form-input" value={form.series_id} onChange={e => set('series_id', e.target.value)} required>
              <option value="">— Select a series —</option>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Season</label>
            <input type="number" className="form-input" value={form.season_number} onChange={e => set('season_number', e.target.value)} min="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Episode #</label>
            <input type="number" className="form-input" value={form.episode_number} onChange={e => set('episode_number', e.target.value)} min="1" />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Video File * (MP4, WebM — max 512MB)</label>
          <input type="file" className="form-input file-input" accept="video/mp4,video/webm,video/*" onChange={e => setVideoFile(e.target.files[0])} required />
        </div>
        <div className="form-group">
          <label className="form-label">Thumbnail (optional)</label>
          <input type="file" className="form-input file-input" accept="image/*" onChange={e => setThumbFile(e.target.files[0])} />
        </div>
      </div>

      <button type="submit" className="btn btn-primary upload-btn" disabled={uploading}>
        {uploading ? <><span className="spinner spinner-sm" /> Uploading...</> : 'Upload Video'}
      </button>
    </form>
  )
}

function SeriesForm({ onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', genre: GENRES[0], language: LANGUAGES[0], content_rating: RATINGS[0] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createSeries(form)
      setForm({ title: '', description: '', genre: GENRES[0], language: LANGUAGES[0], content_rating: RATINGS[0] })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create series.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="series-form">
      {error && <div className="auth-error">{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Series Title *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Series name" />
        </div>
        <div className="form-group">
          <label className="form-label">Genre *</label>
          <select className="form-input" value={form.genre} onChange={e => set('genre', e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Language *</label>
          <select className="form-input" value={form.language} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Content Rating *</label>
          <select className="form-input" value={form.content_rating} onChange={e => set('content_rating', e.target.value)}>
            {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this series about?" rows={2} required />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <span className="spinner spinner-sm" /> : 'Create Series'}
      </button>
    </form>
  )
}

export default function CreatorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [statsRes, videosRes, seriesRes] = await Promise.all([
        getStats(), getMyVideos(1), getMySeries(),
      ])
      setStats(statsRes.data)
      setVideos(videosRes.data.videos)
      setSeriesList(seriesRes.data.series)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!user.is_creator) { navigate('/become-creator'); return }
    load()
  }, [user])

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this video? This cannot be undone.')) return
    try {
      await deleteVideo(id)
      setVideos((v) => v.filter((x) => x.id !== id))
      if (stats) setStats({ ...stats, total_videos: stats.total_videos - 1 })
    } catch { /* ignore */ }
  }

  const togglePublish = async (video) => {
    try {
      const { data } = await updateVideo(video.id, { is_published: !video.is_published })
      setVideos((v) => v.map((x) => x.id === video.id ? data.video : x))
    } catch { /* ignore */ }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="creator-page">
      <div className="container creator-container">
        <div className="creator-header">
          <div>
            <h1 className="creator-title">Creator Dashboard</h1>
            <p className="creator-subtitle">Welcome back, {user?.display_name}</p>
          </div>
        </div>

        {stats && <StatsBar stats={stats} />}

        {/* Tabs */}
        <div className="creator-tabs">
          {['overview', 'upload', 'series', 'manage'].map((t) => (
            <button
              key={t}
              className={`creator-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? 'Overview' : t === 'upload' ? 'Upload Video' : t === 'series' ? 'Create Series' : 'Manage Videos'}
            </button>
          ))}
        </div>

        <div className="creator-panel fade-in">
          {tab === 'overview' && (
            <div className="overview-panel">
              <h2>Recent Uploads</h2>
              {stats?.recent_videos?.length === 0 ? (
                <p className="muted">No videos yet. Upload your first video.</p>
              ) : (
                <div className="recent-list">
                  {stats?.recent_videos?.map((v) => (
                    <div key={v.id} className="recent-item">
                      {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} className="recent-thumb" />}
                      <div className="recent-info">
                        <span className="recent-title">{v.title}</span>
                        <span className="recent-meta">{Number(v.view_count).toLocaleString()} views · {v.genre}</span>
                      </div>
                      <span className={`pub-badge ${v.is_published ? 'pub' : 'draft'}`}>
                        {v.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'upload' && (
            <div>
              <h2 className="panel-heading">Upload a Video</h2>
              <p className="panel-sub">Original content only. By uploading, you confirm you own the rights to this video.</p>
              <UploadForm seriesList={seriesList} onSuccess={load} />
            </div>
          )}

          {tab === 'series' && (
            <div>
              <h2 className="panel-heading">Create a New Series</h2>
              <p className="panel-sub">Organize your episodes into a series for a better viewing experience.</p>
              <SeriesForm onSuccess={load} />
              {seriesList.length > 0 && (
                <div className="series-list-section">
                  <h3>Your Series</h3>
                  <div className="series-list">
                    {seriesList.map((s) => (
                      <div key={s.id} className="series-list-item">
                        {s.thumbnail_url && <img src={s.thumbnail_url} alt={s.title} className="series-list-thumb" />}
                        <div>
                          <p className="series-list-title">{s.title}</p>
                          <p className="series-list-meta">{s.genre} · {s.episode_count} episodes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'manage' && (
            <div>
              <h2 className="panel-heading">Manage Videos</h2>
              {videos.length === 0 ? (
                <p className="muted">No videos yet.</p>
              ) : (
                <div className="manage-list">
                  {videos.map((v) => (
                    <div key={v.id} className="manage-item">
                      {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} className="manage-thumb" />}
                      <div className="manage-info">
                        <span className="manage-title">{v.title}</span>
                        <span className="manage-meta">{v.genre} · {Number(v.view_count).toLocaleString()} views</span>
                        {v.series_title && <span className="manage-series">{v.series_title}</span>}
                      </div>
                      <div className="manage-actions">
                        <button
                          className={`btn ${v.is_published ? 'btn-ghost' : 'btn-outline-cyan'}`}
                          onClick={() => togglePublish(v)}
                        >
                          {v.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteVideo(v.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
