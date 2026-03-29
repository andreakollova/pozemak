'use client'

import Link from 'next/link'
import { Sun, Moon, Play } from 'lucide-react'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Slovensko', href: '#', flag: '🇸🇰' },
  { label: 'Česko',     href: '#', flag: '🇨🇿' },
  { label: 'Holandsko', href: '/', flag: '🇳🇱', active: true },
  { label: 'Nemecko',   href: '#', flag: '🇩🇪' },
  { label: 'Anglicko',  href: '#', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { label: 'EHF',       href: '#', flag: '🏑' },
  { label: 'FIH',       href: '#', flag: '🌍' },
]

export default function Navbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,8,8,0.94)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Top bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 25, fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            POZE<span style={{ color: 'var(--green)' }}>MAK</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/videos"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5, padding: '6px 12px', borderRadius: 8, border: '1px solid transparent', transition: 'all .15s' }}
            onMouseEnter={(e: any) => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'rgba(0,255,135,0.25)'; e.currentTarget.style.background = 'rgba(0,255,135,0.06)' }}
            onMouseLeave={(e: any) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
          >
            <Play size={12} fill="currentColor" /> Video zóna
          </Link>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          <button onClick={onToggle}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all .15s' }}
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
          {NAV_ITEMS.map((item, i) => {
            const isActive = item.active && (pathname === '/' || pathname === item.href)
            return (
              <Link key={item.label} href={item.href}
                style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '9px 14px',
                  fontSize: 11, fontWeight: isActive ? 800 : 600,
                  letterSpacing: isActive ? 1.2 : 1,
                  textTransform: 'uppercase',
                  color: isActive ? '#00FF87' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  borderBottom: isActive ? '2px solid #00FF87' : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e: any) => {
                  if (!isActive) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)' }
                }}
                onMouseLeave={(e: any) => {
                  if (!isActive) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderBottomColor = 'transparent' }
                }}
              >
                <span style={{ fontSize: 13 }}>{item.flag}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
