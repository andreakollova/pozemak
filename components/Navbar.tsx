'use client'

import Link from 'next/link'
import { Sun, Moon, Play } from 'lucide-react'

export default function Navbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,8,8,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}>
            POZE<span style={{ color: 'var(--green)' }}>MAK</span>
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/videos" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
            onMouseEnter={(e: any) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e: any) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Play size={14} /> Videá
          </Link>
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
