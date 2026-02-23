import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">Mini<span className="gradient-text">Stream</span></span>
            <p>Original stories. Indie creators. No noise.</p>
          </div>
          <div className="footer__links">
            <div className="footer__col">
              <span className="footer__col-title">Platform</span>
              <Link to="/about">About</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/content-rules">Content Rules</Link>
            </div>
            <div className="footer__col">
              <span className="footer__col-title">Legal</span>
              <Link to="/dmca">Copyright / DMCA</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
            <div className="footer__col">
              <span className="footer__col-title">Support</span>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} MiniStream. All rights reserved.</p>
          <p>Creators are responsible for their uploaded content.</p>
        </div>
      </div>
    </footer>
  )
}
