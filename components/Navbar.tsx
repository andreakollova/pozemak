'use client'

import Link from 'next/link'
import { Sun, Moon, Play } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Slovensko', href: '#' },
  { label: 'Česko',     href: '#' },
  { label: 'Holandsko', href: '#' },
  { label: 'Nemecko',   href: '#' },
  { label: 'Anglicko',  href: '#' },
  { label: 'EHF',       href: '#' },
  { label: 'FIH',       href: '#' },
]

export default function Navbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Top bar: logo + actions */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            POZE<span style={{ color: 'var(--green)' }}>MAK</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/videos" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5 }}
            onMouseEnter={(e: any) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e: any) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Play size={13} /> Video zóna
          </Link>
          <button onClick={onToggle} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Bottom nav: category links */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none', padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', display: 'block', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={(e: any) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderBottomColor = 'var(--green)' }}
              onMouseLeave={(e: any) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderBottomColor = 'transparent' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
