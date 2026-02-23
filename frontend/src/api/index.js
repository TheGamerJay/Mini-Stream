import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401; clear bad tokens on 422
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          })
          localStorage.setItem('access_token', data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
    }
    // 422 = token unprocessable (corrupted/wrong format) — clear and force re-login
    if (error.response?.status === 422) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    return Promise.reject(error)
  }
)

// Auth
export const signup = (data) => api.post('/auth/signup', data)
export const login = (data) => api.post('/auth/login', data)
export const googleAuth = (token) => api.post('/auth/google', { token })
export const getMe = () => api.get('/auth/me')
export const becomeCreator = () => api.post('/auth/become-creator')
export const updateProfile = (data) => api.put('/auth/profile', data)
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/auth/reset-password', data)

// Discover
export const getHomeData = () => api.get('/discover/home')
export const search = (params) => api.get('/discover/search', { params })
export const getGenres = () => api.get('/discover/genres')
export const browseVideos = (params) => api.get('/discover/browse', { params })

// Videos
export const getVideo = (id) => api.get(`/videos/${id}`)
export const getWatchLater = () => api.get('/videos/watch-later')
export const addWatchLater = (id) => api.post(`/videos/${id}/watch-later`)
export const removeWatchLater = (id) => api.delete(`/videos/${id}/watch-later`)
export const getWatchLaterStatus = (id) => api.get(`/videos/${id}/watch-later/status`)

// Series
export const getSeries = (id) => api.get(`/series/${id}`)
export const listSeries = (params) => api.get('/series/', { params })

// Creator
export const uploadVideo = (formData) =>
  api.post('/creator/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const createSeries = (data) => api.post('/creator/series', data)
export const updateSeries = (id, data) => api.put(`/creator/series/${id}`, data)
export const uploadSeriesBanner = (id, formData) =>
  api.post(`/creator/series/${id}/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getMyVideos = (page) => api.get('/creator/videos', { params: { page } })
export const getMySeries = () => api.get('/creator/series-list')
export const updateVideo = (id, data) => api.put(`/creator/videos/${id}`, data)
export const deleteVideo = (id) => api.delete(`/creator/videos/${id}`)
export const getStats = () => api.get('/creator/stats')

// Reports & Contact
export const reportVideo = (id, data) => api.post(`/videos/${id}/report`, data)
export const submitContact = (data) => api.post('/auth/contact', data)

export default api
