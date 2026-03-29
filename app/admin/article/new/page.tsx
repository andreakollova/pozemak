'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

export default function NewArticlePage() {
  const router = useRouter()
  const [titleSk, setTitleSk] = useState('')
  const [textSk, setTextSk] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const create = async () => {
    if (!titleSk.trim()) { setError('Nadpis je povinný'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleSk,
        title_sk: titleSk,
        text: textSk,
        text_sk: textSk,
        image_url: imageUrl,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/admin/article/${data.article.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Chyba pri vytváraní')
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 13,
              cursor: 'pointer',
            }}>
              <ArrowLeft size={14} /> Späť
            </button>
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
              Nový <span style={{ color: 'var(--green)' }}>článok</span>
            </h1>
          </div>
        </div>
        <button
          onClick={create}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'var(--green)', color: '#000', fontWeight: 800, fontSize: 13,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            letterSpacing: 1, textTransform: 'uppercase',
          }}
        >
          <Plus size={14} /> {saving ? 'Vytváram…' : 'Vytvoriť'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', fontSize: 13, padding: '10px 14px', background: 'rgba(255,77,77,0.1)', borderRadius: 8, marginBottom: 24 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Title */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Nadpis *
          </label>
          <input
            value={titleSk}
            onChange={e => setTitleSk(e.target.value)}
            placeholder="Nadpis článku"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Image URL */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            URL obrázka
          </label>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          {imageUrl && (
            <img src={imageUrl} alt="" style={{ marginTop: 12, height: 120, borderRadius: 8, objectFit: 'cover' }} />
          )}
        </div>

        {/* Text */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Text článku
          </label>
          <textarea
            value={textSk}
            onChange={e => setTextSk(e.target.value)}
            rows={20}
            placeholder="Text článku…"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 14,
              outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7,
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      </div>
    </div>
  )
}
