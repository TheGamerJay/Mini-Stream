import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitContact } from '../api'
import './StaticPages.css'

function StaticPage({ title, children }) {
  return (
    <div className="static-page">
      <div className="container static-inner">
        <h1 className="static-title">{title}</h1>
        <div className="static-body">{children}</div>
      </div>
    </div>
  )
}

export function About() {
  return (
    <StaticPage title="About MiniStream">
      <p>MiniStream is an independent streaming platform built for creators of original anime-style series, animated shorts, visual novels, and indie storytelling.</p>
      <p>We believe great stories deserve a cinematic space — free from social noise, algorithmic manipulation, and content theft. MiniStream is calm, focused, and creator-first.</p>
      <h2>Our Mission</h2>
      <p>To give indie creators a professional home for their original work, and to give viewers a distraction-free place to discover and enjoy that work.</p>
      <h2>What Makes Us Different</h2>
      <ul>
        <li>No ads at launch</li>
        <li>No comments, likes, or social metrics</li>
        <li>Cinematic, content-first design</li>
        <li>Genre-organized discovery</li>
        <li>Original content only</li>
      </ul>
    </StaticPage>
  )
}

export function HowItWorks() {
  return (
    <StaticPage title="How It Works">
      <h2>For Viewers</h2>
      <ol>
        <li>Create a free account or browse publicly available content.</li>
        <li>Discover content by genre, trending, or new releases.</li>
        <li>Watch videos and series in a full cinematic player.</li>
        <li>Save videos to your private Watch Later list.</li>
      </ol>
      <h2>For Creators</h2>
      <ol>
        <li>Sign up for a free account.</li>
        <li>Activate your Creator account from your profile menu.</li>
        <li>Create series and upload episodes, or post standalone videos.</li>
        <li>Manage your content and monitor views privately from the Creator Dashboard.</li>
      </ol>
      <h2>Content Guidelines</h2>
      <p>All content must be original and owned by the creator. Stolen, copyrighted, or prohibited content will be removed. See our <Link to="/content-rules">Content Rules</Link> for details.</p>
    </StaticPage>
  )
}

export function ContentRules() {
  return (
    <StaticPage title="Content Rules">
      <p>MiniStream is a platform for creators to share original anime-style series, animated shorts, and indie visual storytelling. By uploading, you agree to these rules.</p>
      <h2>Creator Responsibility</h2>
      <p>Creators are fully responsible for the content they upload. By uploading to MiniStream, creators confirm they have the rights to publish their content and that it complies with these rules and all applicable laws.</p>
      <p>MiniStream does not actively pre-screen uploads.</p>
      <h2>Allowed Content</h2>
      <ul>
        <li>Original videos, series, and animations you created</li>
        <li>Content for which you hold all necessary rights</li>
        <li>Fan-inspired works (non-commercial, clearly labeled, no impersonation of real creators or official franchises)</li>
        <li>Fictional violence, fantasy themes, and mature storytelling (properly tagged)</li>
        <li>Experimental, indie, or stylized content</li>
      </ul>
      <h2>Content Labeling</h2>
      <p>Creators must accurately label their content using genre tags and content warnings where applicable (violence, horror, sensitive themes, maturity level). Mislabeling content may result in removal.</p>
      <h2>Prohibited Content</h2>
      <ul>
        <li>Content you do not own or have rights to distribute</li>
        <li>Content reuploaded from other platforms without permission</li>
        <li>Illegal content of any kind</li>
        <li>Child sexual exploitation or sexualized depictions of minors</li>
        <li>Non-consensual sexual content</li>
        <li>Extreme gore intended solely to shock</li>
        <li>Real-world hate speech or harassment targeting protected groups</li>
        <li>Content that promotes real-world violence or terrorism</li>
        <li>Impersonation of real creators or official franchises</li>
      </ul>
      <h2>AI-Generated Content</h2>
      <p>AI-assisted or AI-generated content is allowed if the creator has the right to use the tools involved, the content is original and not a direct copy of existing works, and AI usage is disclosed where applicable.</p>
      <h2>Enforcement</h2>
      <p>MiniStream reserves the right, at its sole discretion, to remove content or restrict access to the platform if content is found to violate these rules, applicable laws, or the purpose of the platform.</p>
      <p>Repeated or severe violations may result in account suspension or permanent termination. MiniStream may take action without prior notice.</p>
      <h2>Reporting</h2>
      <p>To report content you believe violates these rules, please contact us at <a href="mailto:ministream.help@gmail.com">ministream.help@gmail.com</a>. For copyright issues, see our <Link to="/dmca">DMCA page</Link>.</p>
      <h2>Disclaimer</h2>
      <p>MiniStream is a hosting platform for user-generated content. The views and works shared by creators do not reflect the views of MiniStream.</p>
    </StaticPage>
  )
}

export function DMCA() {
  return (
    <StaticPage title="Copyright / DMCA">
      <p>MiniStream respects intellectual property rights and expects all creators to do the same. Creators are responsible for ensuring they have the legal right to upload and share any content they submit to the platform.</p>
      <h2>Reporting Copyright Issues</h2>
      <p>If you believe content available on MiniStream infringes your copyright, you may request its removal by contacting MiniStream directly.</p>
      <h2>Information Required</h2>
      <p>Please send an email to <strong>ministream.help@gmail.com</strong> including the following details:</p>
      <ul>
        <li>Your full legal name and contact information</li>
        <li>A description of the copyrighted work you believe has been infringed</li>
        <li>The URL or clear identification of the content you believe violates your rights</li>
        <li>A statement that you have a good-faith belief the use is not authorized</li>
        <li>A statement confirming the information you provide is accurate and that you are authorized to act on behalf of the rights holder</li>
        <li>Your electronic signature</li>
      </ul>
    </StaticPage>
  )
}

export function Privacy() {
  return (
    <StaticPage title="Privacy Policy">
      <p>Last updated: 2026</p>
      <p>MiniStream is committed to protecting your privacy. This policy explains what information we collect, how we use it, and what we do not do with your data.</p>
      <h2>Information We Collect</h2>
      <p>We may collect the following information:</p>
      <ul>
        <li>Account information, such as your email address and display name</li>
        <li>Content you upload to the platform and associated metadata</li>
        <li>Basic usage data, such as pages visited and videos watched</li>
      </ul>
      <p>Usage data is collected for platform functionality and is not shared publicly.</p>
      <h2>How We Use Information</h2>
      <p>We use collected information for the following purposes:</p>
      <ul>
        <li>To operate and maintain your account</li>
        <li>To display your content to viewers</li>
        <li>To provide creators with private viewing and performance statistics</li>
      </ul>
      <h2>What We Do Not Do</h2>
      <p>MiniStream does not:</p>
      <ul>
        <li>Sell personal data</li>
        <li>Display public social metrics such as likes, followers, or comments</li>
        <li>Use personal data for advertising or tracking-based marketing</li>
      </ul>
      <h2>Data Retention</h2>
      <p>Account data is retained for as long as your account remains active. You may request deletion of your account and associated data by contacting ministream.help@gmail.com.</p>
      <h2>Contact</h2>
      <p>For privacy-related questions or concerns, please contact ministream.help@gmail.com.</p>
    </StaticPage>
  )
}

export function Terms() {
  return (
    <StaticPage title="Terms of Service">
      <p>By using MiniStream, you agree to these Terms of Service.</p>
      <h2>Accounts</h2>
      <p>You are responsible for maintaining the security of your account. Do not share your login credentials with others. Any activity that occurs under your account is your responsibility.</p>
      <h2>Content</h2>
      <p>Creators retain all rights to their original content. By uploading content to MiniStream, you grant MiniStream a non-exclusive license to host, store, and display your content on the platform.</p>
      <p>You may remove your content at any time by deleting it from your dashboard.</p>
      <h2>Prohibited Use</h2>
      <p>You may not use MiniStream to upload content that violates the platform's <Link to="/content-rules">Content Rules</Link>, infringes intellectual property rights, or violates any applicable laws or regulations.</p>
      <h2>Termination</h2>
      <p>MiniStream reserves the right to suspend or terminate accounts that violate these Terms of Service or other platform policies.</p>
      <h2>Disclaimer</h2>
      <p>MiniStream is provided on an "as-is" basis. We make no guarantees regarding platform availability, uptime, or the accuracy of user-generated content.</p>
      <h2>Changes</h2>
      <p>MiniStream may update these terms from time to time. Continued use of the platform after changes are made constitutes acceptance of the updated terms.</p>
    </StaticPage>
  )
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await submitContact(form)
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StaticPage title="Contact">
      <p>Have a question, suggestion, or need support? Fill out the form below and we'll get back to you within 3–5 business days.</p>

      {done ? (
        <div className="contact-success">
          <div className="contact-success-icon">✓</div>
          <h3>Message sent!</h3>
          <p>Thanks for reaching out. We'll get back to you soon.</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-row">
            <div className="contact-field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={set('name')}
                required
                maxLength={100}
              />
            </div>
            <div className="contact-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={set('email')}
                required
                maxLength={200}
              />
            </div>
          </div>
          <div className="contact-field">
            <label>Subject</label>
            <select value={form.subject} onChange={set('subject')}>
              <option>General Inquiry</option>
              <option>Creator Support</option>
              <option>Bug Report</option>
              <option>Feature Suggestion</option>
              <option>DMCA / Copyright</option>
              <option>Other</option>
            </select>
          </div>
          <div className="contact-field">
            <label>Message</label>
            <textarea
              placeholder="Describe your question or feedback…"
              value={form.message}
              onChange={set('message')}
              required
              rows={6}
              maxLength={2000}
            />
          </div>
          {error && <p className="contact-error">{error}</p>}
          <button type="submit" className="btn btn-primary contact-submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </StaticPage>
  )
}
