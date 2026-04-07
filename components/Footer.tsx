'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Send } from 'lucide-react'

const QUICK_LINKS = [
  { label: '🇳🇱 Netherlands', href: '/' },
  { label: '🇬🇧 Great Britain', href: '/great-britain' },
  { label: '📹 Videos', href: '/videos' },
  { label: '🇮🇪 Ireland', href: '/ireland' },
  { label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', href: '/scotland' },
  { label: '🇦🇺 Australia', href: '/australia' },
  { label: '🇩🇪 Germany', href: '/germany' },
  { label: '🇧🇪 Belgium', href: '/belgium' },
  { label: '🇪🇸 Spain', href: '/spain' },
  { label: '🇦🇷 Argentina', href: '/argentina' },
  { label: '🇮🇳 India',     href: '/india' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]

const SOCIALS = [
  {
    href: 'https://instagram.com/pozemak.sk', label: 'Instagram',
    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  },
  {
    href: 'https://facebook.com/pozemak.sk', label: 'Facebook',
    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  },
  {
    href: 'https://youtube.com/@pozemak', label: 'YouTube',
    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>,
  },
]

export default function Footer({ dark = true }: { dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState<'idle' | 'ok' | 'err'>('idle')

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setSubState('err'); return }
    // TODO: wire up real newsletter service
    setSubState('ok')
    setEmail('')
    setTimeout(() => setSubState('idle'), 4000)
  }

  return (
    <footer style={{
      marginTop: 80,
      borderTop: '1px solid var(--tag-border)',
      background: 'linear-gradient(180deg, var(--blue-subtle) 0%, var(--bg-card) 60%)',
    }}>
      {/* Main grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>

        {/* Brand column */}
        <div style={{ gridColumn: 'span 1' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dark ? '/logo-dark.png' : '/logo-light.png'}
              alt="REFRESH"
              style={{ height: 36, width: 'auto', display: 'block' }}
            />
          </Link>
          <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 220 }}>
            Latest news, results and updates from the world of field hockey in one place.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {SOCIALS.map(({ svg, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 36, height: 36, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = 'var(--accent)'
                  el.style.borderColor = 'var(--accent)'
                  el.style.background = 'var(--blue-subtle)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = 'var(--text-secondary)'
                  el.style.borderColor = 'var(--border)'
                  el.style.background = 'transparent'
                }}
              >
                {svg}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 18 }}>
            Categories
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-secondary)', transition: 'color 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal links */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 18 }}>
            Legal
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-secondary)', transition: 'color 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 18 }}>
            Newsletter
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            Get the latest field hockey news straight to your inbox.
          </p>
          <form onSubmit={subscribe} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                padding: '10px 14px', borderRadius: 9,
                border: '1px solid var(--border)',
                background: 'var(--bg-card-2)',
                color: 'var(--text-primary)',
                fontSize: 13, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 16px', borderRadius: 9, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontWeight: 800, fontSize: 12, letterSpacing: 0.8,
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              {subState === 'ok' ? '✓ Subscribed!' : <><Send size={12} /> Subscribe</>}
            </button>
            {subState === 'err' && (
              <p style={{ fontSize: 11, color: '#ff6b6b', marginTop: 2 }}>Please enter a valid email address.</p>
            )}
          </form>
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: 1, background: 'var(--border)' }} />
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)' }}>DRIXTON s.r.o.</strong> — All rights reserved.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {LEGAL_LINKS.slice(0, 2).map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'none', letterSpacing: 0.3, transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              {label}
            </Link>
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Powered by{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>REFRESH</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
