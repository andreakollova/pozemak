'use client'

import { useState } from 'react'
import { Flag, Send } from 'lucide-react'

const SUBJECTS = [
  'Racism or discriminatory content',
  'Offensive language or hate speech',
  'Copyright violation',
  'Factual error in article',
  'Inappropriate content',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setErrMsg('Please fill in all fields.')
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
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const, transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '6px 14px', borderRadius: 20, background: 'rgba(0,58,208,0.1)', border: '1px solid rgba(0,58,208,0.25)' }}>
          <Flag size={13} color="var(--blue)" />
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)', letterSpacing: 1, textTransform: 'uppercase' }}>Report Content</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px', color: 'var(--text-primary)' }}>
          Report inappropriate content
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          Help us keep Hockey Refresh fair and respectful. Use this form to report racism, offensive language, copyright violations, or errors in articles and comments.
        </p>
      </div>

      {state === 'ok' ? (
        <div style={{ padding: '40px 32px', borderRadius: 16, background: 'rgba(149,255,3,0.08)', border: '1px solid rgba(149,255,3,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px' }}>Report received</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Thank you for helping keep our community safe. We'll review your report and take appropriate action.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Your Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder=""
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--green)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Your Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder=""
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--green)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Report Type
            </label>
            <select
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Details
            </label>
            <textarea
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder=""
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }}
              onFocus={e => (e.target.style.borderColor = 'var(--green)')}
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
              padding: '14px 32px', borderRadius: 10, border: 'none',
              background: state === 'sending' ? 'var(--border)' : 'var(--green)',
              color: '#000', fontWeight: 800, fontSize: 13, letterSpacing: 0.8,
              textTransform: 'uppercase', cursor: state === 'sending' ? 'default' : 'pointer',
              transition: 'opacity 0.15s', alignSelf: 'flex-start',
            }}
            onMouseEnter={e => { if (state !== 'sending') (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            <Send size={14} />
            {state === 'sending' ? 'Sending…' : 'Send Report'}
          </button>
        </form>
      )}
    </div>
  )
}
