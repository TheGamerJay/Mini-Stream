import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, googleAuth } from '../api'
import './Auth.css'

export default function Login() {
  const { authLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(form)
      authLogin(data)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-logo">
            <img src="/Mini Stream logo.png" alt="MiniStream" className="auth-logo-img" />
          </Link>
          <h1>Welcome back</h1>
          <p>Sign in to continue watching</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  )
}
