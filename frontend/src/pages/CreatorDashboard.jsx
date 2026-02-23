import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getStats, getMyVideos, getMySeries,
  uploadVideo, createSeries, updateSeries, updateVideo, deleteVideo,
  mergeClips, publishMerged,
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

function SeriesTab({ seriesList, onRefresh }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditForm({ title: s.title, description: s.description || '', genre: s.genre, language: s.language, content_rating: s.content_rating })
    setEditError('')
  }

  const cancelEdit = () => { setEditingId(null); setEditError('') }

  const setF = (k, v) => setEditForm((f) => ({ ...f, [k]: v }))

  const saveEdit = async (id) => {
    setSaving(true)
    setEditError('')
    try {
      await updateSeries(id, editForm)
      setEditingId(null)
      onRefresh()
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="panel-heading">Create a New Series</h2>
      <p className="panel-sub">Organize your episodes into a series for a better viewing experience.</p>
      <SeriesForm onSuccess={onRefresh} />
      {seriesList.length > 0 && (
        <div className="series-list-section">
          <h3>Your Series</h3>
          <div className="series-list">
            {seriesList.map((s) => (
              <div key={s.id} className="series-list-item">
                {editingId === s.id ? (
                  <div className="series-edit-form">
                    {editError && <div className="auth-error" style={{ marginBottom: 12 }}>{editError}</div>}
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input className="form-input" value={editForm.title} onChange={e => setF('title', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Genre</label>
                        <select className="form-input" value={editForm.genre} onChange={e => setF('genre', e.target.value)}>
                          {GENRES.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Language</label>
                        <select className="form-input" value={editForm.language} onChange={e => setF('language', e.target.value)}>
                          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select className="form-input" value={editForm.content_rating} onChange={e => setF('content_rating', e.target.value)}>
                          {RATINGS.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-input" value={editForm.description} onChange={e => setF('description', e.target.value)} rows={2} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-primary" disabled={saving} onClick={() => saveEdit(s.id)}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {s.thumbnail_url && <img src={s.thumbnail_url} alt={s.title} className="series-list-thumb" />}
                    <div style={{ flex: 1 }}>
                      <p className="series-list-title">{s.title}</p>
                      <p className="series-list-meta">{s.genre} · {s.language} · {s.episode_count} episodes</p>
                    </div>
                    <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => startEdit(s)}>
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ClipStudioTab({ seriesList, onSuccess }) {
  const [clips, setClipsState] = useState([])       // [{id, file, name, objUrl}]
  const clipsRef = useRef([])
  const setClips = useCallback((fn) => {
    setClipsState((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      clipsRef.current = next
      return next
    })
  }, [])

  const [previewIdx, setPreviewIdx] = useState(-1)
  const previewIdxRef = useRef(-1)
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  const [merging, setMerging] = useState(false)
  const [mergeError, setMergeError] = useState('')
  const [mergedUrl, setMergedUrl] = useState('')
  const [mergedDuration, setMergedDuration] = useState(0)

  const [pf, setPf] = useState({
    title: '', description: '', genre: GENRES[0], language: LANGUAGES[0],
    video_type: VIDEO_TYPES[0], content_rating: RATINGS[0],
    series_id: '', episode_number: '', season_number: '1',
  })
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [done, setDone] = useState(false)
  const setP = (k, v) => setPf((f) => ({ ...f, [k]: v }))

  // Add clips from file input
  const addFiles = (e) => {
    const files = Array.from(e.target.files)
    const newClips = files.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f, name: f.name,
      objUrl: URL.createObjectURL(f),
    }))
    setClips((prev) => [...prev, ...newClips])
    e.target.value = ''
  }

  const removeClip = (id) => {
    setClips((prev) => {
      const removed = prev.find((c) => c.id === id)
      if (removed) URL.revokeObjectURL(removed.objUrl)
      return prev.filter((c) => c.id !== id)
    })
  }

  const moveClip = (idx, dir) => {
    setClips((prev) => {
      const next = [...prev]
      const t = idx + dir
      if (t < 0 || t >= next.length) return prev
      ;[next[idx], next[t]] = [next[t], next[idx]]
      return next
    })
  }

  // Sequential DAW-style preview
  const playAt = useCallback((idx) => {
    if (!videoRef.current || idx < 0 || idx >= clipsRef.current.length) {
      previewIdxRef.current = -1
      setPreviewIdx(-1)
      return
    }
    previewIdxRef.current = idx
    setPreviewIdx(idx)
    videoRef.current.src = clipsRef.current[idx].objUrl
    videoRef.current.play().catch(() => {})
  }, [])

  const handleEnded = useCallback(() => {
    playAt(previewIdxRef.current + 1)
  }, [playAt])

  // Merge
  const handleMerge = async () => {
    if (clips.length < 2) { setMergeError('Add at least 2 clips.'); return }
    setMergeError('')
    setMerging(true)
    try {
      const fd = new FormData()
      clips.forEach((c) => fd.append('clips', c.file))
      const { data } = await mergeClips(fd)
      setMergedUrl(data.video_url)
      setMergedDuration(data.duration)
    } catch (err) {
      setMergeError(err.response?.data?.error || 'Merge failed. Check that all clips are valid MP4 files.')
    } finally {
      setMerging(false)
    }
  }

  // Publish
  const handlePublish = async (e) => {
    e.preventDefault()
    setPublishError('')
    setPublishing(true)
    try {
      await publishMerged({ ...pf, video_url: mergedUrl, duration: mergedDuration })
      setDone(true)
      onSuccess()
    } catch (err) {
      setPublishError(err.response?.data?.error || 'Publish failed.')
    } finally {
      setPublishing(false)
    }
  }

  const reset = () => {
    clips.forEach((c) => URL.revokeObjectURL(c.objUrl))
    setClips([])
    setMergedUrl('')
    setMergedDuration(0)
    setMergeError('')
    setDone(false)
    setPf({ title: '', description: '', genre: GENRES[0], language: LANGUAGES[0], video_type: VIDEO_TYPES[0], content_rating: RATINGS[0], series_id: '', episode_number: '', season_number: '1' })
  }

  if (done) {
    return (
      <div className="studio-success">
        <div className="studio-success-icon">✓</div>
        <h3>Published!</h3>
        <p>Your merged video is now live on MiniStream.</p>
        <button className="btn btn-ghost" onClick={reset}>Start a new merge</button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="panel-heading">Clip Studio</h2>
      <p className="panel-sub">
        Add your clips, arrange them like a timeline, preview the sequence, merge into one video, then publish.
      </p>

      {!mergedUrl ? (
        <>
          {/* ── Timeline / clip list ── */}
          <div className="studio-timeline">
            {clips.length === 0 ? (
              <div className="studio-empty" onClick={() => fileInputRef.current?.click()}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
                </svg>
                <p>Click to add clips</p>
                <span>MP4 · WebM · up to {20} clips</span>
              </div>
            ) : (
              <div className="studio-track">
                {clips.map((c, i) => (
                  <div key={c.id} className={`studio-clip${previewIdx === i ? ' playing' : ''}`}>
                    <video className="studio-clip-thumb" src={c.objUrl} preload="metadata" muted />
                    <div className="studio-clip-info">
                      <span className="studio-clip-num">{i + 1}</span>
                      <span className="studio-clip-name" title={c.name}>{c.name.replace(/\.[^.]+$/, '')}</span>
                    </div>
                    <div className="studio-clip-btns">
                      <button className="studio-btn" onClick={() => moveClip(i, -1)} disabled={i === 0} title="Move left">◀</button>
                      <button className="studio-btn" onClick={() => moveClip(i, 1)} disabled={i === clips.length - 1} title="Move right">▶</button>
                      <button className="studio-btn studio-btn--remove" onClick={() => removeClip(c.id)} title="Remove">✕</button>
                    </div>
                  </div>
                ))}
                <button className="studio-add-tile" onClick={() => fileInputRef.current?.click()} title="Add more clips">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={addFiles}
          />

          {/* ── Preview player ── */}
          {clips.length > 0 && (
            <div className="studio-player-wrap">
              <video
                ref={videoRef}
                className="studio-player"
                controls
                onEnded={handleEnded}
              />
              <div className="studio-player-controls">
                <button className="btn btn-ghost" onClick={() => playAt(0)}>
                  ▶ Preview sequence ({clips.length} clips)
                </button>
                {previewIdx >= 0 && (
                  <span className="studio-now-playing">
                    Now playing clip {previewIdx + 1} / {clips.length}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Merge button ── */}
          {clips.length >= 2 && (
            <div className="studio-merge-row">
              {mergeError && <div className="auth-error" style={{ marginBottom: 12 }}>{mergeError}</div>}
              <button className="btn btn-primary studio-merge-btn" onClick={handleMerge} disabled={merging}>
                {merging
                  ? <><span className="spinner spinner-sm" /> Merging {clips.length} clips… this may take a moment</>
                  : `⚡ Merge ${clips.length} clips into one video`}
              </button>
            </div>
          )}
        </>
      ) : (
        /* ── Merged result + publish form ── */
        <div className="studio-result">
          <div className="studio-result-header">
            <span className="studio-result-badge">✓ Merged successfully</span>
            <button className="btn btn-ghost studio-redo" onClick={() => setMergedUrl('')}>← Re-merge</button>
          </div>

          <video className="studio-result-video" src={mergedUrl} controls />

          <h3 className="studio-publish-heading">Publish this video</h3>
          <form onSubmit={handlePublish} className="upload-form">
            {publishError && <div className="auth-error">{publishError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={pf.title} onChange={(e) => setP('title', e.target.value)} required placeholder="Give your video a title" />
              </div>
              <div className="form-group">
                <label className="form-label">Genre *</label>
                <select className="form-input" value={pf.genre} onChange={(e) => setP('genre', e.target.value)}>
                  {GENRES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language *</label>
                <select className="form-input" value={pf.language} onChange={(e) => setP('language', e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Video Type</label>
                <select className="form-input" value={pf.video_type} onChange={(e) => { setP('video_type', e.target.value); if (e.target.value !== 'Episode') setP('series_id', '') }}>
                  {VIDEO_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select className="form-input" value={pf.content_rating} onChange={(e) => setP('content_rating', e.target.value)}>
                  {RATINGS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" value={pf.description} onChange={(e) => setP('description', e.target.value)} rows={3} required placeholder="Describe this video…" />
            </div>
            {pf.video_type === 'Episode' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Series *</label>
                  <select className="form-input" value={pf.series_id} onChange={(e) => setP('series_id', e.target.value)} required>
                    <option value="">— Select a series —</option>
                    {seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Season</label>
                  <input type="number" className="form-input" value={pf.season_number} onChange={(e) => setP('season_number', e.target.value)} min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Episode #</label>
                  <input type="number" className="form-input" value={pf.episode_number} onChange={(e) => setP('episode_number', e.target.value)} min="1" />
                </div>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={publishing}>
              {publishing ? <><span className="spinner spinner-sm" /> Publishing…</> : 'Publish Video'}
            </button>
          </form>
        </div>
      )}
    </div>
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
          {[
            ['overview', 'Overview'],
            ['upload', 'Upload Video'],
            ['series', 'Create Series'],
            ['manage', 'Manage Videos'],
            ['studio', 'Clip Studio'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`creator-tab${tab === key ? ' active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
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
            <SeriesTab seriesList={seriesList} onRefresh={load} />
          )}

          {tab === 'studio' && (
            <ClipStudioTab seriesList={seriesList} onSuccess={load} />
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
