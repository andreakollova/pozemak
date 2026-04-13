'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.body.classList.contains('light'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '8vh', background: 'var(--bg-dark)',
    }}>
      <div className="glass" style={{ padding: 48, borderRadius: 20, width: '100%', maxWidth: 400 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={isLight ? '/logo-dark.png' : '/logo-light.png'} alt="Pozemak" style={{ height: 40, width: 'auto', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>Admin panel</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Name
            </label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder=""
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15, outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15, outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p style={{ color: '#ff4d4d', fontSize: 13, padding: '10px 14px', background: 'rgba(255,77,77,0.1)', borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 8, padding: '14px', borderRadius: 10, border: 'none',
              background: 'var(--blue)', color: '#fff', fontWeight: 800, fontSize: 14,
              letterSpacing: 1, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
