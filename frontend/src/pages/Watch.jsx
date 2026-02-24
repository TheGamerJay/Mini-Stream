import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVideo, addWatchLater, removeWatchLater, getWatchLaterStatus, reportVideo, saveProgress, getVideoProgress } from '../api'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'
import './Watch.css'

const REPORT_REASONS = [
  'Spam or misleading',
  'Hate speech or harassment',
  'Violence or graphic content',
  'Copyright infringement',
  'Inappropriate for rating',
  'Other',
]

export default function Watch() {
  const { id } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seriesEpisodes, setSeriesEpisodes] = useState([])

  const videoRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const savedSecondsRef = useRef(0)
  const metadataReadyRef = useRef(false)
  const [resumeSeconds, setResumeSeconds] = useState(0)
  const [showResumeBanner, setShowResumeBanner] = useState(false)

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportNotes, setReportNotes] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportDone, setReportDone] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    savedSecondsRef.current = 0
    metadataReadyRef.current = false
    setResumeSeconds(0)
    setShowResumeBanner(false)
    getVideo(id)
      .then(({ data }) => {
        setVideo(data.video)
        if (user) {
          getWatchLaterStatus(id).then(({ data: s }) => setSaved(s.saved)).catch(() => {})
          getVideoProgress(id).then(({ data: p }) => {
            const secs = p.seconds || 0
            savedSecondsRef.current = secs
            if (secs > 0) {
              setResumeSeconds(secs)
              setShowResumeBanner(true)
              // If metadata already loaded before this resolved, seek now
              if (metadataReadyRef.current && videoRef.current) {
                videoRef.current.currentTime = secs
              }
            }
          }).catch(() => {})
        }
      })
      .catch(() => setError('Video not found or unavailable.'))
      .finally(() => setLoading(false))
  }, [id, user])

  // Save progress on unmount or video id change
  useEffect(() => {
    return () => {
      clearInterval(progressIntervalRef.current)
      if (videoRef.current) {
        const seconds = Math.floor(videoRef.current.currentTime)
        if (seconds > 0) saveProgress(id, seconds).catch(() => {})
      }
    }
  }, [id])

  const handleLoadedMetadata = () => {
    metadataReadyRef.current = true
    if (savedSecondsRef.current > 0 && videoRef.current) {
      videoRef.current.currentTime = savedSecondsRef.current
    }
  }

  const handlePlay = () => {
    setShowResumeBanner(false)
    clearInterval(progressIntervalRef.current)
    progressIntervalRef.current = setInterval(() => {
      if (!videoRef.current) return
      const seconds = Math.floor(videoRef.current.currentTime)
      if (seconds > 0) saveProgress(id, seconds).catch(() => {})
    }, 30000)
  }

  const handlePause = () => {
    clearInterval(progressIntervalRef.current)
    if (!videoRef.current) return
    const seconds = Math.floor(videoRef.current.currentTime)
    if (seconds > 0) saveProgress(id, seconds).catch(() => {})
  }

  const handleEnded = () => {
    clearInterval(progressIntervalRef.current)
    if (!videoRef.current) return
    // Save as full duration so it registers as completed (>= 95%)
    const seconds = Math.floor(videoRef.current.duration) || Math.floor(videoRef.current.currentTime)
    if (seconds > 0) saveProgress(id, seconds).catch(() => {})
  }

  const toggleSave = async () => {
    if (!user || saving) return
    setSaving(true)
    try {
      if (saved) {
        await removeWatchLater(id)
        setSaved(false)
      } else {
        await addWatchLater(id)
        setSaved(true)
      }
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  const submitReport = async (e) => {
    e.preventDefault()
    setReportSubmitting(true)
    try {
      await reportVideo(id, { reason: reportReason, notes: reportNotes })
      setReportDone(true)
    } catch { /* ignore */ } finally {
      setReportSubmitting(false)
    }
  }

  const closeReport = () => {
    setReportOpen(false)
    setReportDone(false)
    setReportReason(REPORT_REASONS[0])
    setReportNotes('')
  }

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    return `${m}:${String(sec).padStart(2,'0')}`
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (error) return <div className="watch-error container"><p>{error}</p><Link to="/home" className="btn btn-ghost">Back to Home</Link></div>
  if (!video) return null

  return (
    <div className="watch-page">
      <div className="watch-player-wrap">
        <video
          ref={videoRef}
          className="watch-player"
          src={video.video_url}
          controls
          autoPlay={false}
          poster={video.thumbnail_url || undefined}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />
        {showResumeBanner && resumeSeconds > 0 && (
          <div className="watch-resume-banner">
            <span>Resuming from {fmtTime(resumeSeconds)}</span>
            <button
              className="watch-resume-restart"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0
                savedSecondsRef.current = 0
                setShowResumeBanner(false)
              }}
            >
              Start over
            </button>
          </div>
        )}
      </div>

      <div className="container watch-body">
        <div className="watch-main">
          {/* Tags */}
          <div className="watch-tags">
            {video.genre && <span className="tag tag-cyan">{video.genre}</span>}
            {video.content_rating && <span className="tag tag-rating">{video.content_rating}</span>}
            {video.language && <span className="tag tag-neutral">{video.language}</span>}
            {video.series_title && <span className="tag tag-violet">Series</span>}
            {video.episode_number && (
              <span className="tag tag-violet">
                S{video.season_number || 1} E{video.episode_number}
              </span>
            )}
          </div>

          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-meta">
            {video.creator_name && (
              <span className="watch-creator">
                By {video.creator_name}
                <span className="watch-creator-badge">✦ Creator</span>
              </span>
            )}
            {video.series_title && (
              <Link to={`/series/${video.series_id}`} className="watch-series-link">
                {video.series_title}
              </Link>
            )}
            {video.duration_formatted && <span>{video.duration_formatted}</span>}
            <span>{Number(video.view_count).toLocaleString()} views</span>
          </div>

          <div className="watch-actions">
            {user && (
              <button
                className={`btn watch-save-btn ${saved ? 'btn-outline-cyan' : 'btn-ghost'}`}
                onClick={toggleSave}
                disabled={saving}
              >
                {saved ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" /></svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" /></svg>
                    Save to Watch Later
                  </>
                )}
              </button>
            )}
            <button className="btn watch-report-btn" onClick={() => setReportOpen(true)}>
              Report
            </button>
          </div>

          {video.description && (
            <div className="watch-description">
              <h3>About this video</h3>
              <p>{video.description}</p>
            </div>
          )}
        </div>

        {/* Episode sidebar if part of a series */}
        {video.series_id && (
          <div className="watch-sidebar">
            <h3 className="sidebar-title">More from this Series</h3>
            <Link to={`/series/${video.series_id}`} className="btn btn-ghost sidebar-series-btn">
              View All Episodes
            </Link>
          </div>
        )}
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div className="report-overlay" onClick={closeReport}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="report-close" onClick={closeReport}>✕</button>
            {reportDone ? (
              <div className="report-done">
                <div className="report-done-icon">✓</div>
                <h3>Report submitted</h3>
                <p>Thanks for helping keep MiniStream safe. We'll review this content.</p>
                <button className="btn btn-ghost" onClick={closeReport}>Close</button>
              </div>
            ) : (
              <>
                <h3 className="report-title">Report this video</h3>
                <p className="report-sub">Help us understand the issue</p>
                <form onSubmit={submitReport}>
                  <div className="report-reasons">
                    {REPORT_REASONS.map((r) => (
                      <label key={r} className={`report-reason ${reportReason === r ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reportReason === r}
                          onChange={() => setReportReason(r)}
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                  <textarea
                    className="report-notes"
                    placeholder="Additional details (optional)"
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    className="btn report-submit-btn"
                    disabled={reportSubmitting}
                  >
                    {reportSubmitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
