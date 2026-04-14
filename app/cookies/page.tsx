export default function CookiePolicy() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
      <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', margin: '0 0 8px' }}>Cookie Policy</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 48 }}>Last updated: April 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>1. What are cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies cannot run programs or deliver viruses to your device.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>2. How we use cookies</h2>
          <p>Hockey Refresh uses cookies for the following purposes:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 5, padding: '16px 20px' }}>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Essential cookies</p>
              <p>These are required for the website to function correctly. They include cookies that remember your display preference (dark or light mode). You cannot opt out of these cookies as the site will not function properly without them.</p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 5, padding: '16px 20px' }}>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Analytics cookies</p>
              <p>We may use analytics tools (such as Vercel Analytics or similar) to understand how visitors use our site. These tools may set cookies to collect anonymous information about page views, session duration, and traffic sources. This helps us improve the website.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>3. Specific cookies we set</h2>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 800 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 800 }}>Purpose</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 800 }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>theme</td>
                  <td style={{ padding: '10px 12px' }}>Remembers your dark/light mode preference</td>
                  <td style={{ padding: '10px 12px' }}>1 year</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>_vercel_*</td>
                  <td style={{ padding: '10px 12px' }}>Vercel infrastructure and analytics</td>
                  <td style={{ padding: '10px 12px' }}>Session / 1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>4. Third-party cookies</h2>
          <p>Some pages may embed content from third parties (such as YouTube video players). These third parties may set their own cookies subject to their own privacy policies. We have no control over these cookies. We encourage you to review the privacy policies of any third-party services.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>5. How to control cookies</h2>
          <p>You can control and delete cookies through your browser settings. Most browsers allow you to:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>View what cookies are stored and delete them individually.</li>
            <li>Block third-party cookies.</li>
            <li>Block all cookies from specific sites.</li>
            <li>Block all cookies from being set.</li>
            <li>Delete all cookies when you close your browser.</li>
          </ul>
          <p style={{ marginTop: 12 }}>Please note that disabling cookies may affect the functionality of this and many other websites you visit.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>6. Changes to this policy</h2>
          <p>We may update this Cookie Policy from time to time. Any changes will be reflected on this page with an updated date. We recommend checking back periodically to stay informed.</p>
        </section>

      </div>
    </div>
  )
}
