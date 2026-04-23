'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setErrMsg('Please fill in all required fields.')
      setState('err')
      return
    }
    if (!form.email.includes('@')) {
      setErrMsg('Please enter a valid email address.')
      setState('err')
      return
    }
    setState('sending')
    try {
      const res = await fetch('https://formspree.io/f/xzdykwbr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setState('ok')
      } else {
        setErrMsg('Something went wrong. Please try again.')
        setState('err')
      }
    } catch {
      setErrMsg('Network error. Please try again.')
      setState('err')
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 5,
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const, transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 24px 100px' }}>

      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px', lineHeight: 1.1 }}>
          Contact us
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
          Have a question or want to get in touch? Send us a message and we'll get back to you.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>
          Or email us directly at{' '}
          <a href="mailto:studio@drixton.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>studio@drixton.com</a>
        </p>
      </div>

      {state === 'ok' ? (
        <div style={{ padding: '40px 32px', borderRadius: 6, background: 'rgba(149,255,3,0.08)', border: '1px solid rgba(149,255,3,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px' }}>Message sent!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Thanks for reaching out. We'll get back to you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Your Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Jane Smith"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jane@example.com"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Message *
            </label>
            <textarea
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="How can we help?"
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {state === 'err' && (
            <p style={{ fontSize: 13, color: '#e33', margin: 0 }}>{errMsg}</p>
          )}

          <button
            type="submit"
            disabled={state === 'sending'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 5, border: 'none',
              background: state === 'sending' ? 'var(--border)' : 'var(--accent)',
              color: state === 'sending' ? 'var(--text-secondary)' : '#fff',
              fontWeight: 800, fontSize: 13, letterSpacing: 0.8,
              textTransform: 'uppercase', cursor: state === 'sending' ? 'default' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <Send size={14} />
            {state === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}
