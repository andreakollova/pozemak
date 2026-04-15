'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Calendar, Globe, Sun, Moon } from 'lucide-react'

const ITEMS = [
  { label: 'Countries', href: '/countries', icon: Globe },
  { label: 'Videos',    href: '/videos',    icon: Play },
  { label: 'Matches',   href: '/competition', icon: Calendar },
]

export default function BottomNav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const itemColor = (href: string) =>
    isActive(href) ? 'var(--accent)' : 'var(--text-secondary)'

  return (
    <>
      <style>{`
        .bnav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; padding: 8px 16px; min-width: 60px; transition: opacity .15s; }
        .bnav-item:active { opacity: 0.6; }
        .bnav-label { font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
        .bnav-home-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; }
        .bnav-home-btn { width: 52px; height: 52px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(var(--accent-rgb, 149,255,3), 0.35); margin-top: -18px; transition: transform .15s, box-shadow .15s; }
        .bnav-home-btn:active { transform: scale(0.93); }
        .bnav-toggle { background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 16px; min-width: 60px; }
        .bnav-toggle:active { opacity: 0.6; }
      `}</style>

      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 200,
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(68px + env(safe-area-inset-bottom))',
      }}>

        {/* Countries */}
        <Link href="/countries" className="bnav-item">
          <Globe size={22} color={itemColor('/countries')} strokeWidth={isActive('/countries') ? 2.5 : 1.8} />
          <span className="bnav-label" style={{ color: itemColor('/countries') }}>Countries</span>
        </Link>

        {/* Videos */}
        <Link href="/videos" className="bnav-item">
          <Play size={22} color={itemColor('/videos')} fill={isActive('/videos') ? 'var(--accent)' : 'none'} strokeWidth={1.8} />
          <span className="bnav-label" style={{ color: itemColor('/videos') }}>Videos</span>
        </Link>

        {/* Home — center elevated */}
        <Link href="/" className="bnav-home-wrap">
          <div className="bnav-home-btn">
            <Home size={22} color="#000" strokeWidth={2.2} />
          </div>
          <span className="bnav-label" style={{ color: isActive('/') ? 'var(--accent)' : 'var(--text-secondary)', marginTop: 2 }}>Home</span>
        </Link>

        {/* Matches */}
        <Link href="/competition" className="bnav-item">
          <Calendar size={22} color={itemColor('/competition')} strokeWidth={isActive('/competition') ? 2.5 : 1.8} />
          <span className="bnav-label" style={{ color: itemColor('/competition') }}>Matches</span>
        </Link>

        {/* Dark / Light toggle */}
        <button className="bnav-toggle" onClick={onToggle}>
          {dark
            ? <Sun size={22} color="var(--text-secondary)" strokeWidth={1.8} />
            : <Moon size={22} color="var(--text-secondary)" strokeWidth={1.8} />
          }
          <span className="bnav-label" style={{ color: 'var(--text-secondary)' }}>{dark ? 'Light' : 'Dark'}</span>
        </button>

      </nav>
    </>
  )
}
