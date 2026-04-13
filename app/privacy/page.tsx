export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
      <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', margin: '0 0 8px' }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 48 }}>Last updated: April 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>1. Who we are</h2>
          <p>Hockey Refresh is a field hockey news and media platform operated by Hockey Refresh. We collect and curate news, results, fixtures, and video highlights from the world of field hockey. Our website is accessible at <strong style={{ color: 'var(--text-primary)' }}>hockeyrefresh.com</strong>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>2. What data we collect</h2>
          <p>We may collect the following types of personal data:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Email address</strong> — if you subscribe to our newsletter.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Usage data</strong> — pages visited, time spent, browser type, and device information, collected automatically via analytics tools.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Cookies</strong> — small files stored on your device to remember preferences (e.g. dark/light mode). See our Cookie Policy for details.</li>
          </ul>
          <p style={{ marginTop: 12 }}>We do not collect payment information, and we do not require account registration to use the site.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>3. How we use your data</h2>
          <p>We use the data we collect to:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Send you our newsletter if you have subscribed.</li>
            <li>Analyse how visitors use our website so we can improve it.</li>
            <li>Remember your display preferences (e.g. dark/light mode).</li>
            <li>Detect and prevent technical issues or abuse.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>4. Legal basis for processing</h2>
          <p>We process your personal data on the following legal bases:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Consent</strong> — for newsletter subscriptions and non-essential cookies.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Legitimate interest</strong> — for basic analytics and site security.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>5. Data sharing</h2>
          <p>We do not sell, rent, or trade your personal data. We may share data with trusted third-party service providers (such as email delivery services or analytics platforms) strictly to operate our services. These processors are contractually required to keep your data confidential and secure.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>6. Data retention</h2>
          <p>We retain your email address for as long as you remain subscribed to our newsletter. You may unsubscribe at any time using the link in any email we send. Analytics data is retained in aggregated, anonymised form.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>7. Your rights</h2>
          <p>Under applicable data protection law (including GDPR where applicable), you have the right to:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict processing.</li>
            <li>Withdraw consent at any time.</li>
          </ul>
          <p style={{ marginTop: 12 }}>To exercise any of these rights, please contact us at <strong style={{ color: 'var(--text-primary)' }}>info@hockeyrefresh.com</strong>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>8. Security</h2>
          <p>We take reasonable technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse. However, no system is completely secure and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>9. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. The date at the top of this page will always reflect the most recent version. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
        </section>

      </div>
    </div>
  )
}
