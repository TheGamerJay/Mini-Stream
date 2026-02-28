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
      <p>MiniStream is built to inspire better stories — not chase numbers.</p>
      <p>We are an independent streaming platform built for creators of original anime-style series, animated shorts, visual novels, and indie storytelling. MiniStream is calm, focused, and creator-first.</p>

      <h2>Our Philosophy</h2>
      <p>MiniStream exists to raise creative quality through inspiration, not pressure. We believe great stories deserve a cinematic space — free from social noise, algorithmic manipulation, and content theft.</p>
      <ul>
        <li>No algorithm pressure</li>
        <li>No public follower or popularity competition</li>
        <li>No forced monetization</li>
        <li>Focus on stories, not influencers</li>
      </ul>
      <p>After finishing a series or episode, you may be quietly reminded that you can create and share your own series on MiniStream. Discovery is earned through real audience interest — not paid promotion.</p>

      <h2>What Makes Us Different</h2>
      <ul>
        <li>No ads</li>
        <li>No engagement-manipulating algorithms</li>
        <li>Cinematic, content-first design</li>
        <li>Genre-organized discovery</li>
        <li>Original and creator-owned content</li>
        <li>Discovery driven by likes, watch completion, and watchlist adds — nothing else</li>
      </ul>

      <h2>Monetization</h2>
      <p>MiniStream uses Stripe Connect to handle optional creator support. Watching content is always free. Supporting a creator is entirely voluntary and never required to access content.</p>
      <p>When a creator enables support:</p>
      <ul>
        <li>Creator receives 90% of each support payment</li>
        <li>MiniStream retains a 10% platform fee</li>
        <li>Stripe processing fees are deducted separately from the gross payment before payouts</li>
        <li>Exact payout amounts may vary based on payment processing fees</li>
      </ul>
      <p>MiniStream earns only when creators earn. There is no pay-to-discover or pay-to-rank model.</p>

      <h2>Legal Structure</h2>
      <ul>
        <li>MiniStream is a platform, not a publisher or employer</li>
        <li>Creators retain full ownership of their intellectual property</li>
        <li>Creators are responsible for their own taxes and content compliance</li>
        <li>Support payments are voluntary and generally non-refundable</li>
        <li>Content is creator-generated — MiniStream does not guarantee content quality or completion</li>
      </ul>
      <p>See our <Link to="/terms">Terms of Service</Link> and <Link to="/creator-agreement">Creator Agreement</Link> for full details.</p>
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
      <ul>
        <li>Account information, such as your email address and display name</li>
        <li>Content you upload to the platform and associated metadata</li>
        <li>Basic usage data, such as pages visited and videos watched</li>
      </ul>
      <p>Usage data is collected for platform functionality and is not shared publicly.</p>
      <h2>How We Use Information</h2>
      <ul>
        <li>To operate and maintain your account</li>
        <li>To display your content to viewers</li>
        <li>To provide creators with private viewing and performance statistics</li>
      </ul>
      <h2>What We Do Not Do</h2>
      <ul>
        <li>Sell personal data</li>
        <li>Display public social metrics such as followers or comments</li>
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

      <h2>1. Platform Role</h2>
      <p>MiniStream is a hosting and distribution platform. All content available on MiniStream is created and uploaded by independent creators. MiniStream does not create, edit, endorse, or guarantee any creator content.</p>
      <p>Creators using MiniStream are independent individuals or studios. MiniStream is not a publisher, employer, agent, or representative of any creator.</p>

      <h2>2. Viewing &amp; Access</h2>
      <p>Viewing content on MiniStream is free unless explicitly stated otherwise by a creator. MiniStream does not require payment to watch content.</p>
      <p>Some creators may offer optional support options. Supporting a creator is voluntary and is not required to access content unless clearly stated by the creator.</p>

      <h2>3. Content Responsibility</h2>
      <p>All content on MiniStream is creator-generated. MiniStream is not responsible for the accuracy, quality, legality, completeness, or delivery of creator content.</p>
      <p>MiniStream makes no warranties regarding content quality, completion, or suitability. Use of the platform is at the user's own discretion.</p>

      <h2>4. Creator Intellectual Property</h2>
      <p>Creators retain full ownership of all intellectual property rights to their content. Uploading content to MiniStream does not transfer ownership to MiniStream.</p>
      <p>Creators grant MiniStream a non-exclusive, worldwide license to host, stream, and display their content solely for the purpose of operating the platform.</p>

      <h2>5. Monetization &amp; Revenue</h2>
      <p>Creators may enable optional monetization features such as voluntary support. When monetization is enabled, MiniStream retains a platform fee of 10%. Payment processing fees are deducted separately by the payment provider.</p>
      <p>Creators who enable monetization are subject to platform fees as described in the <Link to="/creator-agreement">Creator Agreement</Link>. MiniStream does not guarantee any level of earnings, visibility, or audience engagement.</p>

      <h2>6. Payments, Taxes &amp; Payouts</h2>
      <p>Creators are responsible for providing accurate payout information and for reporting and paying any applicable taxes. MiniStream does not provide tax advice. All payments and payouts are processed through third-party payment providers.</p>

      <h2>7. Refund Policy</h2>
      <p>Support payments are voluntary contributions to creators and are generally non-refundable. Refunds may be issued at the discretion of the creator or in cases of fraud, duplicate charges, or technical errors. All refunds are processed through the original payment provider.</p>

      <h2>8. Accounts</h2>
      <p>You are responsible for maintaining the security of your account. Do not share your login credentials with others. Any activity that occurs under your account is your responsibility.</p>

      <h2>9. Prohibited Use</h2>
      <p>You may not use MiniStream to upload content that violates the platform's <Link to="/content-rules">Content Rules</Link>, infringes intellectual property rights, or violates any applicable laws or regulations.</p>

      <h2>10. Enforcement &amp; Moderation</h2>
      <p>MiniStream reserves the right to remove or restrict content or accounts that violate these terms or applicable law.</p>

      <h2>11. Disclaimer</h2>
      <p>MiniStream is provided on an "as-is" basis. We make no guarantees regarding platform availability, uptime, or the accuracy of user-generated content. MiniStream is not responsible for creator content, creator conduct, or creator obligations.</p>

      <h2>12. Changes</h2>
      <p>MiniStream may update these terms from time to time. Continued use of the platform after changes are made constitutes acceptance of the updated terms.</p>
    </StaticPage>
  )
}

export function CreatorAgreement() {
  return (
    <StaticPage title="Creator Agreement">
      <p>Last updated: 2026</p>
      <p>This Creator Agreement applies to anyone who uploads or monetizes content on MiniStream. By uploading content or enabling monetization features, you agree to the terms below.</p>

      <h2>1. Creator Status</h2>
      <p>Creators on MiniStream are independent individuals or studios. MiniStream is not a publisher, employer, agent, or representative of any creator. Creators create and control their own work.</p>

      <h2>2. Ownership of Content</h2>
      <p>Creators retain full ownership of all intellectual property rights to their content. Uploading content to MiniStream does not transfer ownership to MiniStream.</p>

      <h2>3. License to MiniStream</h2>
      <p>To operate the platform, creators grant MiniStream a non-exclusive, worldwide license to host, stream, and display their content solely for the purpose of operating MiniStream. This license ends if the content is removed from the platform.</p>

      <h2>4. Monetization &amp; Support</h2>
      <p>Creators may choose to enable optional monetization features such as voluntary viewer support. Monetization is optional. Viewers are never required to pay to watch content unless clearly stated by the creator. Supporting a creator is voluntary.</p>

      <h2>5. Revenue Split</h2>
      <p>When monetization is enabled, MiniStream retains a platform fee of 10%. Payment processing fees are deducted separately by the payment provider. Payouts are handled automatically through third-party payment services such as Stripe. MiniStream earns revenue only when creators earn revenue.</p>

      <h2>6. Payments &amp; Taxes</h2>
      <p>Creators are responsible for providing accurate payout information. Creators are responsible for reporting and paying any applicable taxes. MiniStream does not provide tax advice and does not handle creator tax filings.</p>

      <h2>7. No Earnings Guarantee</h2>
      <p>MiniStream does not guarantee earnings, audience size, visibility, or support amounts. Creator success depends on audience interest and creator activity.</p>

      <h2>8. Refunds</h2>
      <p>Support payments are voluntary contributions and are generally non-refundable. Refunds may be issued at the creator's discretion or in cases of fraud, duplicate charges, or technical errors. All refunds are processed through the original payment provider.</p>

      <h2>9. Content Responsibility</h2>
      <p>Creators are solely responsible for their content, including originality, rights, permissions, and legal compliance. MiniStream does not review, endorse, or guarantee creator content.</p>

      <h2>10. Enforcement</h2>
      <p>MiniStream may remove or restrict content or accounts that violate platform rules, this agreement, or applicable law.</p>

      <h2>11. Agreement to Terms</h2>
      <p>By uploading content or enabling monetization, creators confirm that they have the right to upload the content and agree to this Creator Agreement.</p>
    </StaticPage>
  )
}

export function FAQ() {
  return (
    <StaticPage title="Frequently Asked Questions">

      <h2>General</h2>
      <h3>What is MiniStream?</h3>
      <p>MiniStream is a creator-first video platform focused on original anime, animated series, and creative video content. All content is uploaded by independent creators who retain full ownership of their work.</p>

      <h3>Is MiniStream free to use?</h3>
      <p>Yes. Watching content on MiniStream is free. There is no required subscription to view content.</p>

      <h3>Does MiniStream use algorithms to decide what gets promoted?</h3>
      <p>No. MiniStream does not use engagement-manipulating algorithms. Discovery is based on real user actions such as likes, watch completion, and watchlist adds.</p>

      <h2>Watching Content</h2>
      <h3>Do I need to pay to watch videos?</h3>
      <p>No. Watching content on MiniStream is free unless a creator clearly states otherwise.</p>

      <h3>Are there ads?</h3>
      <p>No. MiniStream does not run ads on creator content.</p>

      <h3>Can I support a creator?</h3>
      <p>Yes. Some creators offer optional support. Supporting a creator is completely voluntary and never required to watch content.</p>

      <h2>Creators &amp; Uploading</h2>
      <h3>Who can upload content to MiniStream?</h3>
      <p>Independent creators and studios can upload content, subject to platform guidelines and approval.</p>

      <h3>Do creators own their content?</h3>
      <p>Yes. Creators retain full ownership of their intellectual property. Uploading to MiniStream does not transfer ownership.</p>

      <h3>Does MiniStream claim rights to creator content?</h3>
      <p>No. Creators grant MiniStream a non-exclusive license only to host, stream, and display content for platform operation.</p>

      <h2>Monetization &amp; Payments</h2>
      <h3>How does monetization work?</h3>
      <p>Creators may enable optional monetization features such as voluntary support. Viewers can choose to support creators if they wish.</p>

      <h3>Is supporting a creator required?</h3>
      <p>No. Supporting creators is optional and never required to access content.</p>

      <h3>How much does MiniStream take?</h3>
      <p>When monetization is enabled, MiniStream retains a 10% platform fee. Payment processing fees are deducted separately by the payment provider.</p>

      <h3>Who handles payments?</h3>
      <p>Payments and payouts are handled through Stripe. MiniStream does not manually handle creator funds.</p>

      <h3>Does MiniStream guarantee earnings?</h3>
      <p>No. MiniStream does not guarantee earnings, audience size, or visibility.</p>

      <h2>Refunds</h2>
      <h3>Are support payments refundable?</h3>
      <p>Support payments are voluntary contributions and are generally non-refundable.</p>

      <h3>When are refunds issued?</h3>
      <p>Refunds may be issued at the creator's discretion or in cases of fraud, duplicate charges, or technical errors.</p>

      <h3>How are refunds processed?</h3>
      <p>All refunds are processed through the original payment provider.</p>

      <h2>Legal &amp; Responsibility</h2>
      <h3>Is MiniStream responsible for creator content?</h3>
      <p>No. All content on MiniStream is creator-generated. MiniStream does not guarantee accuracy, quality, legality, or completion of content.</p>

      <h3>Is MiniStream a publisher or employer?</h3>
      <p>No. MiniStream is a platform. Creators are independent individuals or studios.</p>

      <h3>Can MiniStream remove content?</h3>
      <p>Yes. MiniStream reserves the right to remove or restrict content or accounts that violate platform rules or applicable law.</p>

      <h2>Safety &amp; Trust</h2>
      <h3>How does MiniStream protect creativity?</h3>
      <p>MiniStream avoids algorithm pressure, forced monetization, and popularity contests. The platform is designed to encourage creativity through inspiration, not competition.</p>

      <h3>How does MiniStream make money?</h3>
      <p>MiniStream earns only when creators earn, through a small platform fee on optional creator support.</p>

      <h3>What makes MiniStream different?</h3>
      <p>MiniStream is built to respect creators, respect viewers, and focus on stories — not metrics, ads, or algorithms.</p>
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
