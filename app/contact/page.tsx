'use client'

import { useState } from 'react'
import { Star, Send, Globe, Smartphone, Instagram } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setState('ok')
      } else {
        const data = await res.json()
        setErrMsg(data.error || 'Something went wrong. Please try again.')
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

  const PERKS = [
    { icon: <Globe size={18} />, title: 'Website & App', desc: 'Your news featured on hockeyrefresh.com and in the Hockey Refresh iOS app — reaching fans everywhere.' },
    { icon: <Instagram size={18} />, title: 'Social Media', desc: 'We share featured content on our Instagram and other social channels to maximise your reach.' },
    { icon: <Smartphone size={18} />, title: 'Push Notifications', desc: 'Top stories are pushed directly to app users — your biggest news gets instant visibility.' },
  ]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '6px 14px', borderRadius: 4, background: 'rgba(0,58,208,0.1)', border: '1px solid rgba(0,58,208,0.25)' }}>
          <Star size={13} color="var(--blue)" />
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)', letterSpacing: 1, textTransform: 'uppercase' }}>Get Featured</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 14px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
          Interested in being featured on Hockey Refresh?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, maxWidth: 600 }}>
          We work with national federations, clubs, and organisations that regularly publish field hockey news.
          If you want your content to reach thousands of hockey fans around the world — we'd love to hear from you.
        </p>
      </div>

      {/* Perks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        {PERKS.map(p => (
          <div key={p.title} style={{ padding: '20px 18px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--accent)', marginBottom: 10 }}>{p.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>{p.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {state === 'ok' ? (
        <div style={{ padding: '40px 32px', borderRadius: 6, background: 'rgba(149,255,3,0.08)', border: '1px solid rgba(149,255,3,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px' }}>Message received!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Thanks for reaching out. We'll review your message and get back to you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
            Fill in the form below and we'll get back to you
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                placeholder="jane@hockeyclub.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Club / Federation / Organisation
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              placeholder="e.g. Hockey Club Amsterdam, Hockey Ireland…"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Tell us about yourself *
            </label>
            <textarea
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Tell us about your club or federation, the type of content you publish, your website or social media links, and anything else you'd like us to know."
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
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 5, border: 'none',
              background: state === 'sending' ? 'var(--border)' : 'var(--accent)',
              color: state === 'sending' ? 'var(--text-secondary)' : '#fff',
              fontWeight: 800, fontSize: 13, letterSpacing: 0.8,
              textTransform: 'uppercase', cursor: state === 'sending' ? 'default' : 'pointer',
              transition: 'opacity 0.15s', alignSelf: 'flex-start',
            }}
            onMouseEnter={e => { if (state !== 'sending') (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            <Send size={14} />
            {state === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}
