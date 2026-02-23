import { Link } from 'react-router-dom'
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
      <p>MiniStream is a platform for original creative work. By uploading, you agree to these rules.</p>
      <h2>You May Upload</h2>
      <ul>
        <li>Original videos, series, and animations you created</li>
        <li>Content for which you hold all necessary rights</li>
        <li>Fan works where you own all original elements (no copyrighted audio, footage, or characters without a clear license)</li>
      </ul>
      <h2>You May Not Upload</h2>
      <ul>
        <li>Content you do not own or have rights to distribute</li>
        <li>Content from other platforms (YouTube, Netflix, Crunchyroll, etc.)</li>
        <li>Hate speech, harassment, or content targeting individuals</li>
        <li>Explicit sexual content</li>
        <li>Illegal content of any kind</li>
        <li>Real-world violence or gore</li>
      </ul>
      <h2>Enforcement</h2>
      <p>MiniStream does not actively pre-screen user uploads. However, MiniStream reserves the right to review, remove, or restrict access to any content that violates these rules or applicable laws.</p>
      <p>Creators are solely responsible for the content they upload. Repeated or serious violations may result in account suspension or permanent termination.</p>
      <p>MiniStream reserves the right, at its sole discretion, to remove content or limit access to the platform for material that is unlawful, harmful, abusive, or otherwise inconsistent with the purpose and standards of the platform.</p>
      <h2>DMCA</h2>
      <p>To report copyright infringement, please visit our <Link to="/dmca">DMCA page</Link>.</p>
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
      <p>By using MiniStream, you agree to these terms.</p>
      <h2>Accounts</h2>
      <p>You are responsible for maintaining the security of your account. Do not share your credentials.</p>
      <h2>Content</h2>
      <p>Creators retain all rights to their original content. By uploading, you grant MiniStream a non-exclusive license to host and display your content on the platform. You may remove your content at any time by deleting it from your dashboard.</p>
      <h2>Prohibited Use</h2>
      <p>You may not use MiniStream to upload content that violates our <Link to="/content-rules">Content Rules</Link>, infringe intellectual property rights, or violate any applicable law.</p>
      <h2>Termination</h2>
      <p>MiniStream reserves the right to suspend or terminate accounts that violate these terms.</p>
      <h2>Disclaimer</h2>
      <p>MiniStream is provided as-is. We make no warranties regarding uptime or content accuracy.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use of the platform constitutes acceptance.</p>
    </StaticPage>
  )
}

export function Contact() {
  return (
    <StaticPage title="Contact">
      <p>Have a question or need support? Reach out to us below.</p>
      <h2>General Inquiries</h2>
      <p>Email: <a href="mailto:ministream.help@gmail.com">ministream.help@gmail.com</a></p>
      <h2>DMCA / Copyright</h2>
      <p>Email: <a href="mailto:ministream.help@gmail.com">ministream.help@gmail.com</a></p>
      <h2>Privacy</h2>
      <p>Email: <a href="mailto:ministream.help@gmail.com">ministream.help@gmail.com</a></p>
      <p className="note">We aim to respond within 3–5 business days.</p>
    </StaticPage>
  )
}
