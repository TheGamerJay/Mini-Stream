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
      <p>All content must be original and owned by the creator. Stolen, copyrighted, or prohibited content will be removed. See our <a href="/content-rules">Content Rules</a> for details.</p>
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
      <p>MiniStream does not actively pre-screen uploads but will remove content that violates these rules. Creators are fully responsible for the content they upload. Repeated violations will result in account termination.</p>
      <h2>DMCA</h2>
      <p>To report copyright infringement, please visit our <a href="/dmca">DMCA page</a>.</p>
    </StaticPage>
  )
}

export function DMCA() {
  return (
    <StaticPage title="Copyright / DMCA">
      <p>MiniStream respects intellectual property rights. If you believe content on this platform infringes your copyright, please submit a DMCA takedown notice.</p>
      <h2>How to Submit a DMCA Notice</h2>
      <p>Send an email to <strong>dmca@ministream.app</strong> with the following information:</p>
      <ol>
        <li>Your full legal name and contact information</li>
        <li>A description of the copyrighted work you claim has been infringed</li>
        <li>The URL(s) of the allegedly infringing content on MiniStream</li>
        <li>A statement that you have a good faith belief that the use is not authorized</li>
        <li>A statement, under penalty of perjury, that the information is accurate and you are the rights holder or authorized to act on their behalf</li>
        <li>Your physical or electronic signature</li>
      </ol>
      <h2>Disclaimer</h2>
      <p>MiniStream does not claim ownership of any content uploaded by creators. All uploaded content is the sole responsibility of the creator who uploaded it. MiniStream acts as a platform and responds to valid DMCA notices in accordance with applicable law.</p>
    </StaticPage>
  )
}

export function Privacy() {
  return (
    <StaticPage title="Privacy Policy">
      <p>Last updated: {new Date().getFullYear()}</p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Account information: email address, display name</li>
        <li>Content you upload and associated metadata</li>
        <li>Basic usage data: pages visited, videos watched (not shared publicly)</li>
      </ul>
      <h2>How We Use It</h2>
      <ul>
        <li>To operate your account and provide the platform</li>
        <li>To display your content to viewers</li>
        <li>To provide creators with private view statistics</li>
      </ul>
      <h2>What We Do Not Do</h2>
      <ul>
        <li>We do not sell your personal data</li>
        <li>We do not display public social metrics (likes, followers, comments)</li>
        <li>We do not use your data for advertising targeting</li>
      </ul>
      <h2>Data Retention</h2>
      <p>We retain account data as long as your account is active. You may request deletion by contacting us at privacy@ministream.app.</p>
      <h2>Contact</h2>
      <p>For privacy concerns, contact privacy@ministream.app.</p>
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
      <p>You may not use MiniStream to upload content that violates our <a href="/content-rules">Content Rules</a>, infringe intellectual property rights, or violate any applicable law.</p>
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
      <p>Email: <a href="mailto:hello@ministream.app">hello@ministream.app</a></p>
      <h2>DMCA / Copyright</h2>
      <p>Email: <a href="mailto:dmca@ministream.app">dmca@ministream.app</a></p>
      <h2>Privacy</h2>
      <p>Email: <a href="mailto:privacy@ministream.app">privacy@ministream.app</a></p>
      <p className="note">We aim to respond within 3–5 business days.</p>
    </StaticPage>
  )
}
