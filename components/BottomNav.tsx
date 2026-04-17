'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Calendar, Globe, Gamepad2 } from 'lucide-react'

const ITEMS = [
  { label: 'Videos',    href: '/videos',      Icon: Play },
  { label: 'Home',      href: '/',             Icon: Home },
  { label: 'Matches',   href: '/competition',  Icon: Calendar },
  { label: 'Countries', href: '/countries',    Icon: Globe },
  { label: 'Games',     href: '/game/',        Icon: Gamepad2, external: true },
]

export default function BottomNav({ dark }: { dark: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <style>{`
        .bnav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: stretch; justify-content: center;
          gap: 0px;
          padding: 10px max(32px, env(safe-area-inset-left)) calc(12px + env(safe-area-inset-bottom)) max(32px, env(safe-area-inset-right));
          background: var(--navbar-bg);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
        }
        .bnav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-decoration: none;
          min-height: 48px; padding: 4px 4px;
          max-width: 90px;
        }
        .bnav-item:active { opacity: 0.6; }
        .bnav-icon {
          width: 40px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px;
        }
        .bnav-label {
          font-size: 8px; font-weight: 700;
          letter-spacing: 0.2px; margin-top: 3px;
        }
      `}</style>

      <nav className="bnav">
        {ITEMS.map(({ label, href, Icon, external }) => {
          const active = isActive(href)
          const lightActive = !dark && active
          const darkActive  =  dark && active

          const iconColor = external ? 'var(--green)' : lightActive ? '#fff' : darkActive ? 'var(--accent)' : 'var(--text-secondary)'
          const labelColor = external ? 'var(--green)' : lightActive ? 'var(--blue)' : darkActive ? 'var(--accent)' : 'var(--text-secondary)'
          const iconBg = lightActive ? 'var(--blue)' : 'transparent'

          const content = (
            <>
              <div className="bnav-icon" style={{ background: iconBg }}>
                <Icon size={23} color={iconColor} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="bnav-label" style={{ color: labelColor }}>{label}</span>
            </>
          )

          return external
            ? <a key={href} href={href} className="bnav-item">{content}</a>
            : <Link key={href} href={href} className="bnav-item">{content}</Link>
        })}
      </nav>
    </>
  )
}
