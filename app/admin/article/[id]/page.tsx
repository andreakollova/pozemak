'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getArticleById, getTitle, getText } from '@/lib/supabase'
import { ArrowLeft, Save, Share2, Star } from 'lucide-react'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [titleSk, setTitleSk] = useState('')
  const [textSk, setTextSk] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isTopStory, setIsTopStory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [igError, setIgError] = useState('')
  const [settingTop, setSettingTop] = useState(false)

  useEffect(() => {
    getArticleById(id).then(a => {
      if (a) {
        setTitleSk(getTitle(a))
        setTextSk(getText(a) || '')
        setImageUrl(a.image_url || '')
        setIsTopStory(!!a.top_story)
      }
      setLoading(false)
    })
  }, [id])

  const setTopStory = async () => {
    setSettingTop(true)
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ top_story: true }),
    })
    if (res.ok) setIsTopStory(true)
    setSettingTop(false)
  }

  const postInstagram = async () => {
    setPosting(true)
    setIgError('')
    setPosted(false)
    const res = await fetch(`/api/admin/instagram/${id}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setPosted(true)
      // Auto-set as top story when posted to Instagram
      await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top_story: true }),
      })
      setIsTopStory(true)
      setTimeout(() => setPosted(false), 5000)
    } else {
      setIgError(data.error || 'Error posting to Instagram')
    }
    setPosting(false)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title_sk: titleSk, text_sk: textSk, image_url: imageUrl }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error || 'Error saving article')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 4, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 13,
              cursor: 'pointer',
            }}>
              <ArrowLeft size={14} /> Back
            </button>
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
              Edit <span style={{ color: 'var(--blue)' }}>article</span>
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={setTopStory}
            disabled={settingTop || isTopStory}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 5,
              border: `1px solid ${isTopStory ? 'rgba(255,193,7,0.6)' : 'rgba(255,193,7,0.3)'}`,
              background: isTopStory ? 'rgba(255,193,7,0.25)' : 'rgba(255,193,7,0.08)',
              color: '#FFC107',
              fontWeight: 800, fontSize: 13,
              cursor: (settingTop || isTopStory) ? 'default' : 'pointer',
              opacity: settingTop ? 0.7 : 1,
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            <Star size={14} fill={isTopStory ? '#FFC107' : 'none'} />
            {isTopStory ? 'Top Story' : settingTop ? 'Setting…' : 'Set Top Story'}
          </button>
          <button
            onClick={postInstagram}
            disabled={posting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 5,
              border: '1px solid rgba(225,48,108,0.4)',
              background: posted ? '#E1306C' : 'rgba(225,48,108,0.15)',
              color: posted ? '#fff' : '#E1306C',
              fontWeight: 800, fontSize: 13,
              cursor: posting ? 'not-allowed' : 'pointer',
              opacity: posting ? 0.7 : 1,
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            <Share2 size={14} /> {posting ? 'Posting…' : posted ? 'Posted!' : 'Instagram'}
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 5, border: 'none',
              background: 'var(--blue)',
              color: '#fff', fontWeight: 800, fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            <Save size={14} /> {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', fontSize: 13, padding: '10px 14px', background: 'rgba(255,77,77,0.1)', borderRadius: 4, marginBottom: 24 }}>
          {error}
        </p>
      )}
      {igError && (
        <p style={{ color: '#E1306C', fontSize: 13, padding: '10px 14px', background: 'rgba(225,48,108,0.1)', borderRadius: 4, marginBottom: 24 }}>
          Instagram: {igError}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Title */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Title (EN)
          </label>
          <input
            value={titleSk}
            onChange={e => setTitleSk(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 5, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Image URL */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Image URL
          </label>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 5, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          {imageUrl && (
            <img src={imageUrl} alt="" style={{ marginTop: 12, height: 120, borderRadius: 4, objectFit: 'cover' }} />
          )}
        </div>

        {/* Text */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Text (EN)
          </label>
          <textarea
            value={textSk}
            onChange={e => setTextSk(e.target.value)}
            rows={20}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 5, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 14,
              outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7,
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      </div>
    </div>
  )
}
