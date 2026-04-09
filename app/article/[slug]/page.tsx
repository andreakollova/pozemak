'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Article, getTitle, getText, getArticleSource, getArticles, getSlug } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const router   = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (!slug) return
    supabase
      .from('articles')
      .select('*')
      .ilike('url', `%/${slug}`)
      .single()
      .then(({ data }) => { setArticle(data); setLoading(false) })
  }, [slug])

  useEffect(() => {
    getArticles(20).then(arts => setRelated(arts))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!article) return (
    <div style={{ maxWidth: 800, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Article not found.</p>
      <button onClick={() => router.push('/')} style={{ marginTop: 24, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        ← Back
      </button>
    </div>
  )

  const paragraphs = getText(article)?.split('\n\n').filter(Boolean) || []
  const title  = getTitle(article)
  const source = getArticleSource(article)
  const recommended = related.filter(a => a.id !== article.id).slice(0, 6)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 760px) { .rec-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .rec-grid { grid-template-columns: 1fr; } }
        .rec-card { transition: transform .22s ease, box-shadow .22s ease; }
        .rec-card:hover { transform: translateY(-4px); box-shadow: 0 20px 56px rgba(0,0,0,.45); }
        .rec-card:hover .rec-title { color: var(--accent) !important; }
        .rec-img img { transition: transform .5s ease; }
        .rec-card:hover .rec-img img { transform: scale(1.05); }
      `}</style>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Back */}
        <button
          onClick={() => router.push('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 36, padding: 0, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Tags + Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--tag-text)', background: 'var(--tag-bg)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 6 }}>
            {source.flag} {source.country}
          </span>
          <span style={{ fontSize: 12, color: 'var(--green-text)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
            {formatDate(article.scraped_at)}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', color: 'var(--text-primary)', marginBottom: 28 }}>
          {title}
        </h1>

        {/* Hero image */}
        {article.image_url && (
          <div style={{ borderRadius: 16, overflow: 'hidden' }}>
            <img src={article.image_url} alt={title} style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {/* Byline — under image, above text */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '18px 0', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/writer-1.png" alt="Adrian Smith" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, marginBottom: 1 }}>Written by</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Adrian Smith</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Credit:</strong> {source.name}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Photo:</strong> {source.name}
            </span>
          </div>
        </div>

        {/* Article text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(() => {
            const SUBHEAD_RE = /^[\u{1F300}-\u{1FAFF}]/u
            const stripEmoji = (s: string) => s.replace(/^[\u{1F300}-\u{1FAFF}]\s*/u, '').trim()
            const isSubheading = (s: string) => SUBHEAD_RE.test(s.trim()) && s.trim().length < 100 && !/[.!?]\s/.test(s)
            let subheadIdx = 0
            return paragraphs.map((p, i) => {
              if (isSubheading(p)) {
                const isFirst = subheadIdx === 0
                subheadIdx++
                if (isFirst) {
                  return (
                    <h4 key={i} style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0', lineHeight: 1.35, letterSpacing: '-0.3px' }}>
                      {p.trim()}
                    </h4>
                  )
                }
                return (
                  <h5 key={i} style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0', lineHeight: 1.35, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stripEmoji(p)}
                  </h5>
                )
              }
              return (
                <p key={i} style={{ fontSize: i === 0 ? 18 : 16, lineHeight: 1.8, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i === 0 ? 500 : 400, margin: 0 }}>
                  {p}
                </p>
              )
            })
          })()}
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>More Articles</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="rec-grid">
              {recommended.map(a => {
                const src = getArticleSource(a)
                const t   = getTitle(a)
                return (
                  <Link key={a.id} href={`/article/${getSlug(a)}`} style={{ textDecoration: 'none' }}>
                    <div className="rec-card" style={{ borderRadius: 13, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
                      <div className="rec-img" style={{ height: 130, overflow: 'hidden', background: '#111' }}>
                        {a.image_url
                          ? <img src={a.image_url} alt={t} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d0d0d,#1a1a1a)' }} />
                        }
                      </div>
                      <div style={{ padding: '11px 13px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--tag-text)', background: 'var(--tag-bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{src.flag} {src.country}</span>
                          <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600 }}>{timeAgo(a.scraped_at)}</span>
                        </div>
                        <p className="rec-title" style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, transition: 'color .2s' }}>
                          {t}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </>
  )
}
