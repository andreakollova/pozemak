'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Article } from '@/lib/supabase'
import { ArrowLeft, ExternalLink } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    // Find by URL suffix
    supabase
      .from('articles')
      .select('*')
      .ilike('url', `%/${slug}`)
      .single()
      .then(({ data }) => {
        setArticle(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ maxWidth: 800, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Článok sa nenašiel.</p>
        <button onClick={() => router.push('/')} style={{ marginTop: 24, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Späť
        </button>
      </div>
    )
  }

  const paragraphs = article.text?.split('\n\n').filter(Boolean) || []

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13,
          fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
          marginBottom: 40, padding: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft size={14} /> Späť
      </button>

      {/* Date */}
      <p style={{ fontSize: 12, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
        {formatDate(article.scraped_at)}
      </p>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(26px, 5vw, 48px)',
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: '-1px',
        color: 'var(--text-primary)',
        marginBottom: 32,
      }}>
        {article.title}
      </h1>

      {/* Hero image */}
      {article.image_url && (
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
          <img
            src={article.image_url}
            alt={article.title}
            style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Article text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontSize: i === 0 ? 18 : 16,
            lineHeight: 1.75,
            color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: i === 0 ? 500 : 400,
          }}>
            {p}
          </p>
        ))}
      </div>

      {/* Original source link */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'var(--green)', fontSize: 13, fontWeight: 700,
            letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none',
          }}
        >
          Originál na hockey.nl <ExternalLink size={13} />
        </a>
      </div>
    </main>
  )
}
