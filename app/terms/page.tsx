export default function TermsAndConditions() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
      <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', margin: '0 0 8px' }}>Terms & Conditions</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 48 }}>Last updated: April 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>1. Acceptance of terms</h2>
          <p>By accessing or using Hockey Refresh (the &ldquo;Site&rdquo;), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use the Site. These terms apply to all visitors, readers, and users of the Site.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>2. About the Site</h2>
          <p>Hockey Refresh is a field hockey media platform that aggregates, curates, and presents news, match results, fixtures, and video highlights from the world of field hockey. Content is sourced from publicly available third-party sources and is presented for informational and entertainment purposes only.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>3. Intellectual property</h2>
          <p>All original content produced by Hockey Refresh — including but not limited to written summaries, translations, design elements, and compiled data — is protected by copyright. You may not reproduce, distribute, or republish our original content without prior written permission.</p>
          <p style={{ marginTop: 12 }}>Third-party content (including articles, images, and videos) remains the property of their respective owners. We make reasonable efforts to credit sources and link to originals. If you believe your content has been used improperly, please contact us at <strong style={{ color: 'var(--text-primary)' }}>info@hockeyrefresh.com</strong>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>4. Accuracy of information</h2>
          <p>While we strive to ensure all content is accurate and up to date, we make no warranties or representations regarding the completeness, reliability, or accuracy of any information on the Site. Match results, fixtures, and statistics are sourced from third parties and may occasionally contain errors or delays. You should not rely solely on information from this Site for any official or competitive purpose.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>5. Use of the Site</h2>
          <p>You agree to use the Site only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Attempt to gain unauthorised access to any part of the Site or its infrastructure.</li>
            <li>Scrape, crawl, or harvest data from the Site in a manner that disrupts its operation.</li>
            <li>Use the Site to transmit spam, malware, or any other harmful content.</li>
            <li>Misrepresent your identity or affiliation with any person or organisation.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>6. External links</h2>
          <p>The Site contains links to third-party websites. These links are provided for convenience only. Hockey Refresh has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>7. Disclaimer of warranties</h2>
          <p>The Site is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without any warranties of any kind, either express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>8. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, Hockey Refresh shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of or in connection with your access to or use of (or inability to use) the Site or its content.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>9. Changes to the Site and terms</h2>
          <p>We reserve the right to modify or discontinue any part of the Site at any time without notice. We may also update these Terms & Conditions from time to time. The date at the top of this page reflects the most recent version. Continued use of the Site after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>10. Governing law</h2>
          <p>These Terms & Conditions shall be governed by and construed in accordance with applicable law. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>11. Contact</h2>
          <p>If you have any questions about these Terms & Conditions, please contact us at <strong style={{ color: 'var(--text-primary)' }}>info@hockeyrefresh.com</strong>.</p>
        </section>

      </div>
    </div>
  )
}
