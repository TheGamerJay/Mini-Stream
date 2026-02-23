import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Watch from './pages/Watch'
import SeriesPage from './pages/SeriesPage'
import CreatorDashboard from './pages/CreatorDashboard'
import WatchLater from './pages/WatchLater'
import BecomeCreator from './pages/BecomeCreator'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import {
  About, HowItWorks, ContentRules, DMCA, Privacy, Terms, Contact,
} from './pages/StaticPages'

import './App.css'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (user) return <Navigate to="/home" replace />
  return children
}

function AppRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname === '/Admin'

  if (isAdmin) {
    return <Admin />
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/watch/:id" element={<PrivateRoute><Watch /></PrivateRoute>} />
          <Route path="/series/:id" element={<PrivateRoute><SeriesPage /></PrivateRoute>} />
          <Route path="/watch-later" element={<PrivateRoute><WatchLater /></PrivateRoute>} />
          <Route path="/become-creator" element={<PrivateRoute><BecomeCreator /></PrivateRoute>} />
          <Route path="/creator" element={<PrivateRoute><CreatorDashboard /></PrivateRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/content-rules" element={<ContentRules />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/browse" element={<Navigate to="/home" replace />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
