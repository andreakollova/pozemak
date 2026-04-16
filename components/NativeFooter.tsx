'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Star, ArrowRight } from 'lucide-react'

export default function NativeFooter() {
  const [email, setEmail]       = useState('')
  const [subState, setSubState] = useState<'idle' | 'ok' | 'err'>('idle')

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

  const inputStyle = {
    flex: 1, padding: '13px 16px', borderRadius: 4,
    border: '1px solid var(--border)', background: 'var(--bg-dark)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s', fontFamily: 'inherit',
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 48 }}>

      {/* ── Newsletter ── */}
      <div style={{ padding: '40px 24px 36px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 14 }}>🏑 Newsletter</p>
        <h3 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          Don't miss any hockey news!
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 20px' }}>
          Subscribe and be the first to stay updated on everything happening on and off the pitch.
        </p>
        <form onSubmit={subscribe} style={{ display: 'flex', gap: 10 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '13px 20px', borderRadius: 4, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 800, fontSize: 12, letterSpacing: 1,
              textTransform: 'uppercase', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'opacity 0.15s',
            }}
          >
            {subState === 'ok' ? '✓ Done!' : <><Send size={12} /> Subscribe</>}
          </button>
        </form>
        {subState === 'err' && <p style={{ fontSize: 12, color: '#e33', marginTop: 8 }}>Please enter a valid email address.</p>}
      </div>

      {/* ── Get Featured ── */}
      <div style={{ padding: '36px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 14 }}>🌍 Get Featured</p>
        <h3 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          Want to be featured on Hockey Refresh?
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 20px' }}>
          We feature national federations, clubs, and organisations that publish field hockey news — on the website, app, and our social media channels.
        </p>
        <Link
          href="/contact"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 4,
            background: 'var(--accent)', color: '#fff',
            fontWeight: 800, fontSize: 12, letterSpacing: 1,
            textTransform: 'uppercase', textDecoration: 'none',
          }}
        >
          <Star size={13} /> Get in touch <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Legal links (required for App Store) ── */}
      <div style={{ padding: '24px 24px 16px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginBottom: 16 }}>
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'Contact', href: '/contact' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
              {label}
            </Link>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, opacity: 0.6 }}>
          © {new Date().getFullYear()} Hockey Refresh — All rights reserved.
        </p>
      </div>

    </div>
  )
}
