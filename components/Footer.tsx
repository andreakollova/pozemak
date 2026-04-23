'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Send, Star, ArrowRight } from 'lucide-react'
import PushSubscribe from './PushSubscribe'

const QUICK_LINKS = [
  { label: 'News', href: '/' },
  { label: 'Videos', href: '/videos' },
  { label: 'Matches', href: '/competition' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Credits & Disclaimer', href: '/credits' },
  { label: 'Contact', href: '/contact' },
]

const SOCIALS = [
  {
    href: 'https://www.instagram.com/hockeyrefresh/', label: 'Instagram',
    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  },
  {
    href: 'https://www.facebook.com/hockeyrefresh/', label: 'Facebook',
    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  },
]

export default function Footer() {
  const [email, setEmail]         = useState('')
  const [subState, setSubState]   = useState<'idle' | 'ok' | 'err'>('idle')
  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setSubState('err'); return }
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubState('ok')
        setEmail('')
        setTimeout(() => setSubState('idle'), 4000)
      } else {
        setSubState('err')
      }
    } catch {
      setSubState('err')
    }
  }

  return (
    <>
      {/* ── Pre-footer dual CTA ── */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

          {/* Left — Newsletter */}
          <div style={{ padding: '0 48px 0 0', borderRight: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 20 }}>🏑 Newsletter</p>
            <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, lineHeight: 1.2, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Don't miss any hockey news or competitions!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 420 }}>
              Subscribe to our newsletter and be the first to stay updated on everything happening on and off the pitch.
            </p>
            <form onSubmit={subscribe} style={{ display: 'flex', gap: 10, maxWidth: 440 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: '13px 16px', borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-dark)',
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
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '13px 22px', borderRadius: 4, border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 800, fontSize: 12, letterSpacing: 1,
                  textTransform: 'uppercase', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                {subState === 'ok' ? '✓ Subscribed!' : <><Send size={12} /> Subscribe</>}
              </button>
            </form>
            {subState === 'err' && <p style={{ fontSize: 11, color: '#e33', marginTop: 8 }}>Please enter a valid email address.</p>}
          </div>

          {/* Right — Get Featured */}
          <div style={{ padding: '0 0 0 48px' }}>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 20 }}>🌍 Get Featured</p>
            <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, lineHeight: 1.2, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Want to be featured on Hockey Refresh?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 420 }}>
              We feature national federations, clubs, and organisations that publish field hockey news. Get your content in front of thousands of fans — on the website, app, and our social media channels.
            </p>
            <Link
              href="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 4,
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 800, fontSize: 12, letterSpacing: 1,
                textTransform: 'uppercase', textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              <Star size={13} /> Get in touch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
        {/* Main grid */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>

          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-light.png" alt="REFRESH" style={{ height: 36, width: 'auto', display: 'block' }} />
            </Link>
            <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 220 }}>
              Latest news, results and updates from the world of field hockey in one place.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {SOCIALS.map(({ svg, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: 36, height: 36, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--text-secondary)', transition: 'all 0.15s', textDecoration: 'none' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--green)'; el.style.borderColor = 'var(--green)'; el.style.background = 'rgba(149,255,3,0.1)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--text-secondary)'; el.style.borderColor = 'var(--border)'; el.style.background = 'transparent' }}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 18 }}>Categories</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-secondary)', transition: 'color 0.15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 18 }}>Legal</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-secondary)', transition: 'color 0.15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter mini */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 18 }}>Newsletter</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>Get the latest field hockey news straight to your inbox.</p>
            <form onSubmit={subscribe} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={{ padding: '10px 14px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = 'var(--green)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button type="submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 4, border: 'none', background: 'var(--green)', color: 'var(--blue)', fontWeight: 800, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                {subState === 'ok' ? '✓ Subscribed!' : <><Send size={12} /> Subscribe</>}
              </button>
              {subState === 'err' && <p style={{ fontSize: 11, color: '#e33', marginTop: 2 }}>Please enter a valid email address.</p>}
            </form>
            <div style={{ marginTop: 12 }}>
              <PushSubscribe />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: 1, background: 'var(--border)' }} />
        </div>

        {/* Bottom bar — extra bottom padding to clear cookie banner */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 100px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)' }}>Hockey Refresh</strong> — All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {LEGAL_LINKS.slice(0, 2).map(({ label, href }) => (
              <Link key={label} href={href}
                style={{ fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'none', letterSpacing: 0.3, transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              >{label}</Link>
            ))}
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Powered by <span style={{ color: 'var(--green)', fontWeight: 700 }}>REFRESH</span>
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
