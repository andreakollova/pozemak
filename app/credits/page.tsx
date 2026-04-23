import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credits & Disclaimer',
  description: 'Content credits and disclaimer for Hockey Refresh.',
}

const SOURCES = [
  { flag: '🇳🇱', name: 'HockeyNL', url: 'https://www.hockey.nl', country: 'Netherlands' },
  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England Hockey', url: 'https://www.englandhockey.co.uk', country: 'England' },
  { flag: '🇦🇷', name: 'Confederación Argentina de Hockey', url: 'https://www.cahockey.org.ar', country: 'Argentina' },
  { flag: '🇮🇳', name: 'Hockey India', url: 'https://www.hockeyindia.org', country: 'India' },
  { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', name: 'Hockey Wales', url: 'https://www.hockeywales.org.uk', country: 'Wales' },
  { flag: '🇬🇧', name: 'GB Hockey', url: 'https://www.greatbritainhockey.co.uk', country: 'Great Britain' },
  { flag: '🇮🇪', name: 'Hockey Ireland', url: 'https://www.hockey.ie', country: 'Ireland' },
  { flag: '🇦🇺', name: 'Hockey Australia', url: 'https://www.hockey.org.au', country: 'Australia' },
  { flag: '🇩🇪', name: 'Deutscher Hockey-Bund', url: 'https://www.hockey.de', country: 'Germany' },
  { flag: '🇧🇪', name: 'Royal Belgian Hockey Association', url: 'https://www.hockey.be', country: 'Belgium' },
  { flag: '🇪🇸', name: 'Real Federación Española de Hockey', url: 'https://www.rfeh.es', country: 'Spain' },
  { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scottish Hockey', url: 'https://www.scottish-hockey.org.uk', country: 'Scotland' },
  { flag: '🇺🇾', name: 'Asociación Uruguaya de Hockey', url: 'https://hockey.com.uy', country: 'Uruguay' },
  { flag: '🇳🇿', name: 'Hockey New Zealand', url: 'https://www.hockeynz.co.nz', country: 'New Zealand' },
  { flag: '🇨🇦', name: 'Field Hockey Canada', url: 'https://fieldhockey.ca', country: 'Canada' },
  { flag: '🏑', name: 'FIH – International Hockey Federation', url: 'https://www.fih.hockey', country: 'International' },
  { flag: '🇪🇺', name: 'EuroHockey', url: 'https://www.eurohockey.org', country: 'Europe' },
]

const TECH = [
  { name: 'Next.js', desc: 'React framework for the web and app', url: 'https://nextjs.org' },
  { name: 'Capacitor', desc: 'iOS native app wrapper', url: 'https://capacitorjs.com' },
  { name: 'Supabase', desc: 'Database and storage', url: 'https://supabase.com' },
  { name: 'Vercel', desc: 'Web hosting and deployment', url: 'https://vercel.com' },
  { name: 'OpenAI GPT-4o', desc: 'AI-assisted article rewriting', url: 'https://openai.com' },
  { name: 'Formspree', desc: 'Contact form handling', url: 'https://formspree.io' },
]

export default function CreditsPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 100px' }}>
      <style>{`
        .cr-source-card { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:6px; background:var(--bg-card); border:1px solid var(--border); text-decoration:none; transition:border-color .15s, background .15s; }
        .cr-source-card:hover { border-color:var(--accent); background:var(--bg-card-2); }
        .cr-tech-link { font-weight:800; color:var(--text-primary); text-decoration:none; transition:color .15s; }
        .cr-tech-link:hover { color:var(--accent); }
      `}</style>

      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 14 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 16px', lineHeight: 1.1 }}>
          Credits & Disclaimer
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, maxWidth: 680 }}>
          Hockey Refresh is an independent news aggregator dedicated to field hockey. We collect and rewrite publicly available content from official national federations and governing bodies. All original content, images, and trademarks belong to their respective owners.
        </p>
      </div>

      {/* Disclaimer */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 3, height: 20, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
          Disclaimer
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '24px 28px' }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Hockey Refresh is not affiliated with, endorsed by, or sponsored by</strong> any of the organisations listed below. We are an independent media platform covering field hockey news.
          </p>
          <p style={{ margin: 0 }}>
            All articles published on Hockey Refresh are <strong style={{ color: 'var(--text-primary)' }}>editorial rewrites</strong> of publicly available information sourced from official federation websites. We do not reproduce content verbatim. Each article links back to the original source.
          </p>
          <p style={{ margin: 0 }}>
            All <strong style={{ color: 'var(--text-primary)' }}>images</strong> are sourced from the respective official organisation websites or their official media releases. We do not claim ownership of any third-party images. If you are the rights holder of an image and wish it to be removed, please contact us at <strong style={{ color: 'var(--text-primary)' }}>studio@drixton.com</strong>.
          </p>
          <p style={{ margin: 0 }}>
            All <strong style={{ color: 'var(--text-primary)' }}>team names, federation names, logos, and national emblems</strong> are the property of their respective owners. Their use on this platform is purely for editorial, non-commercial identification purposes.
          </p>
          <p style={{ margin: 0 }}>
            Hockey Refresh is a <strong style={{ color: 'var(--text-primary)' }}>non-commercial fan platform</strong>. We do not sell articles, licences, or content. Any advertising revenue is used solely to cover operating costs.
          </p>
        </div>
      </section>

      {/* Content sources */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 3, height: 20, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
          Content Sources
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          The following official organisations are the original sources of the news content featured on Hockey Refresh. All rights remain with these bodies.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {SOURCES.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="cr-source-card">
              <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{s.flag}</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{s.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.country}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Tech credits */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 3, height: 20, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
          Technology
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {TECH.map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="cr-tech-link">{t.name}</a>
              <span style={{ color: 'var(--border)' }}>—</span>
              <span>{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <div style={{ padding: '20px 24px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        For takedown requests, licensing enquiries, or any questions about this page, contact us at{' '}
        <a href="mailto:studio@drixton.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>studio@drixton.com</a>.
      </div>
    </div>
  )
}
