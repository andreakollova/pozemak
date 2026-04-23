'use client'

import Link from 'next/link'

const COUNTRIES = [
  { label: 'Netherlands',   href: '/netherlands',   flag: '🇳🇱' },
  { label: 'England',       href: '/england',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { label: 'Argentina',     href: '/argentina',     flag: '🇦🇷' },
  { label: 'India',         href: '/india',         flag: '🇮🇳' },
  { label: 'Great Britain', href: '/great-britain', flag: '🇬🇧' },
  { label: 'Wales',         href: '/wales',         flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { label: 'Ireland',       href: '/ireland',       flag: '🇮🇪' },
  { label: 'Australia',     href: '/australia',     flag: '🇦🇺' },
  { label: 'Germany',       href: '/germany',       flag: '🇩🇪' },
  { label: 'Belgium',       href: '/belgium',       flag: '🇧🇪' },
  { label: 'Spain',         href: '/spain',         flag: '🇪🇸' },
  { label: 'Scotland',      href: '/scotland',      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { label: 'Uruguay',       href: '/uruguay',       flag: '🇺🇾' },
  { label: 'New Zealand',   href: '/new-zealand',   flag: '🇳🇿' },
  { label: 'Canada',        href: '/canada',        flag: '🇨🇦' },
]

export default function CountriesPage() {
  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '26px 24px 120px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Countries</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>Browse field hockey news by national team.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {COUNTRIES.map(({ label, href, flag }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 20px',
            borderRadius: 6,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            textDecoration: 'none',
            transition: 'border-color .15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ fontSize: 28 }}>{flag}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
