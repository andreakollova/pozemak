'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Calendar } from 'lucide-react'

const ITEMS = [
  { label: 'Videos',  href: '/videos',      Icon: Play },
  { label: 'Home',    href: '/',             Icon: Home },
  { label: 'Matches', href: '/competition',  Icon: Calendar },
]

export default function BottomNav({ dark }: { dark: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <style>{`
        .bnav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; display: flex; align-items: stretch; justify-content: space-around; padding-bottom: env(safe-area-inset-bottom); background: var(--navbar-bg); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-top: 1px solid var(--border); }
        .bnav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; text-decoration: none; padding: 10px 8px 8px; }
        .bnav-item:active { opacity: 0.6; }
        .bnav-icon { width: 40px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 16px; }
        .bnav-label { font-size: 10px; font-weight: 700; letter-spacing: 0.2px; }
      `}</style>

      <nav className="bnav">
        {ITEMS.map(({ label, href, Icon }) => {
          const active = isActive(href)
          // Light mode active: blue bg + white icon/text
          // Dark mode active: green accent color
          const lightActive = !dark && active
          const darkActive  = dark && active

          const iconColor  = lightActive ? '#fff' : darkActive ? 'var(--accent)' : 'var(--text-secondary)'
          const labelColor = lightActive ? 'var(--blue)' : darkActive ? 'var(--accent)' : 'var(--text-secondary)'
          const iconBg     = lightActive ? 'var(--blue)' : 'transparent'

          return (
            <Link key={href} href={href} className="bnav-item">
              <div className="bnav-icon" style={{ background: iconBg }}>
                <Icon
                  size={22}
                  color={iconColor}
                  strokeWidth={active ? 2.5 : 1.8}
                  fill={label === 'Videos' && active && dark ? 'var(--accent)' : 'none'}
                />
              </div>
              <span className="bnav-label" style={{ color: labelColor }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
