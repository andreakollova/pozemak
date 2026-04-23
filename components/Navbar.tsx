'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Sun, Moon, Play, BarChart2, Gamepad2, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Netherlands',   href: '/netherlands',   flag: '🇳🇱' },
  { label: 'Great Britain', href: '/great-britain', flag: '🇬🇧' },
  { label: 'Australia',     href: '/australia',     flag: '🇦🇺' },
  { label: 'Germany',       href: '/germany',       flag: '🇩🇪' },
  { label: 'Belgium',       href: '/belgium',       flag: '🇧🇪' },
  { label: 'Spain',         href: '/spain',         flag: '🇪🇸' },
  { label: 'Argentina',     href: '/argentina',     flag: '🇦🇷' },
  { label: 'Ireland',       href: '/ireland',       flag: '🇮🇪' },
  { label: 'Scotland',      href: '/scotland',      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { label: 'India',         href: '/india',         flag: '🇮🇳' },
]

const MORE_ITEMS = [
  { label: 'England',     href: '/england',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { label: 'Wales',       href: '/wales',       flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { label: 'New Zealand', href: '/new-zealand', flag: '🇳🇿' },
  { label: 'Uruguay',     href: '/uruguay',     flag: '🇺🇾' },
  { label: 'Canada',      href: '/canada',      flag: '🇨🇦' },
]

export default function Navbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMore  = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMoreOpen(true) }
  const closeMore = () => { closeTimer.current = setTimeout(() => setMoreOpen(false), 120) }

  const moreActive = MORE_ITEMS.some(i => pathname === i.href)

  return (
    <nav style={{
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <style>{`
        @media (max-width: 640px) {
          .navbar-topbar { padding: 0 16px !important; height: 54px !important; }
          .navbar-logo { height: 28px !important; }
          .navbar-links { gap: 4px !important; }
          .navbar-nav-link { font-size: 10px !important; padding: 5px 8px !important; gap: 4px !important; }
        }
        .more-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          min-width: 180px;
          background: var(--navbar-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          padding: 6px;
          z-index: 200;
        }
        .more-dropdown a {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-primary);
          white-space: nowrap;
          transition: background .12s, color .12s;
        }
        .more-dropdown a:hover, .more-dropdown a.active {
          background: var(--bg-card);
          color: var(--accent);
        }
        .more-dropdown a.active {
          font-weight: 800;
        }
      `}</style>

      {/* Top bar */}
      <div className="navbar-topbar" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dark ? '/logo-dark.png' : '/logo-light.png'}
            alt="REFRESH"
            className="navbar-logo"
            style={{ height: 36, width: 'auto', display: 'block', maxWidth: '100%', objectFit: 'contain' }}
          />
        </Link>

        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/videos"
            className="navbar-nav-link"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5, padding: '6px 12px', borderRadius: 4, border: '1px solid transparent', transition: 'all .15s' }}
            onMouseEnter={(e: any) => { e.currentTarget.style.fontWeight = '900'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
            onMouseLeave={(e: any) => { e.currentTarget.style.fontWeight = '700'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
          >
            <Play size={12} fill="currentColor" /> Videos
          </Link>

          <Link href="/competition"
            className="navbar-nav-link"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5, padding: '6px 12px', borderRadius: 4, border: '1px solid transparent', transition: 'all .15s' }}
            onMouseEnter={(e: any) => { e.currentTarget.style.fontWeight = '900'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
            onMouseLeave={(e: any) => { e.currentTarget.style.fontWeight = '700'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
          >
            <BarChart2 size={12} /> Matches
          </Link>

          <a href="/game/"
            className="navbar-nav-link"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5, padding: '6px 12px', borderRadius: 4, border: '1px solid transparent', transition: 'all .15s' }}
            onMouseEnter={(e: any) => { e.currentTarget.style.fontWeight = '900'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
            onMouseLeave={(e: any) => { e.currentTarget.style.fontWeight = '700'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
          >
            <Gamepad2 size={12} /> Games
          </a>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          <button onClick={onToggle}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href}
                style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '9px 14px',
                  fontSize: 11, fontWeight: isActive ? 800 : 600,
                  letterSpacing: isActive ? 1.2 : 1,
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s, font-weight 0.15s',
                }}
                onMouseEnter={(e: any) => { if (!isActive) { e.currentTarget.style.fontWeight = '800'; e.currentTarget.style.borderBottomColor = 'var(--border)' } }}
                onMouseLeave={(e: any) => { if (!isActive) { e.currentTarget.style.fontWeight = '600'; e.currentTarget.style.borderBottomColor = 'transparent' } }}
              >
                <span style={{ fontSize: 13 }}>{item.flag}</span>
                {item.label}
              </Link>
            )
          })}

          {/* More countries dropdown */}
          <div
            style={{ position: 'relative', flexShrink: 0, marginLeft: 'auto', paddingLeft: 8 }}
            onMouseEnter={openMore}
            onMouseLeave={closeMore}
          >
            <button
              onClick={() => setMoreOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '9px 12px',
                fontSize: 11, fontWeight: moreActive ? 800 : 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: moreActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: 'none', border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderBottom: moreActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e: any) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e: any) => { e.currentTarget.style.color = moreActive ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              More
              <ChevronDown size={12} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
            </button>

            {moreOpen && (
              <div className="more-dropdown" onMouseEnter={openMore} onMouseLeave={closeMore}>
                {MORE_ITEMS.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={pathname === item.href ? 'active' : ''}
                    onClick={() => setMoreOpen(false)}
                  >
                    <span style={{ fontSize: 15 }}>{item.flag}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
