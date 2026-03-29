'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-dark)',
    }}>
      <div className="glass" style={{ padding: 48, borderRadius: 20, width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.5px' }}>
          POZE<span style={{ color: 'var(--green)' }}>MAK</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>Admin panel</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Meno
            </label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder=""
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15, outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--green)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Heslo
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15, outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--green)')}
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
              background: 'var(--green)', color: '#000', fontWeight: 800, fontSize: 14,
              letterSpacing: 1, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Prihlasovanie…' : 'Prihlásiť sa'}
          </button>
        </form>
      </div>
    </div>
  )
}
