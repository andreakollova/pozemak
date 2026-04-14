'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getArticlesByDomain, Article, getTitle, getText, getSlug } from '@/lib/supabase'
import { Clock } from 'lucide-react'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

interface CountryConfig {
  flag: string
  name: string
  domain: string
  description: string
}

export default function CountryPage({ config }: { config: CountryConfig }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticlesByDomain(config.domain, 20)
      .then(arts => { setArticles(arts); setLoading(false) })
      .catch(() => setLoading(false))
  }, [config.domain])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!articles.length) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{config.flag}</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>No articles yet</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{config.name} articles will appear here once the scraper runs.</p>
    </div>
  )

  const [hero, ...rest] = articles
  const secondary = rest.slice(0, 3)
  const grid = rest.slice(3)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .cp-wrap     { max-width:1200px; margin:0 auto; padding:24px 24px 100px; animation:fadeUp .4s ease; }
        .cp-sec-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .cp-grid     { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media(max-width:860px){
          .cp-sec-grid { grid-template-columns:repeat(2,1fr); }
          .cp-grid     { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:520px){
          .cp-sec-grid { grid-template-columns:1fr; }
          .cp-grid     { grid-template-columns:1fr; }
        }
        .cp-card { transition: transform .25s ease, box-shadow .25s ease; }
        .cp-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.5); }
        .cp-img img { transition: transform .6s ease; }
        .cp-img:hover img { transform: scale(1.05); }
        .cp-card:hover .cp-title { color: var(--accent) !important; }
      `}</style>

      <div className="cp-wrap">

        {/* Country header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <span style={{ fontSize: 36 }}>{config.flag}</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{config.name}</h1>
          </div>
        </div>

        {/* Hero */}
        {hero && <HeroCard article={hero} flag={config.flag} name={config.name} />}

        {/* Secondary */}
        {secondary.length > 0 && (
          <div className="cp-sec-grid" style={{ marginTop: 16, marginBottom: 48 }}>
            {secondary.map(a => <SecondaryCard key={a.id} article={a} flag={config.flag} name={config.name} />)}
          </div>
        )}

        {/* More */}
        {grid.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>More News</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="cp-grid" style={{ marginBottom: 60 }}>
              {grid.map(a => <GridCard key={a.id} article={a} flag={config.flag} />)}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function HeroCard({ article, flag, name }: { article: Article; flag: string; name: string }) {
  const [hov, setHov] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)
  const text  = (getText(article) || '').slice(0, 180).trim() + '…'

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 16, borderRadius: 4, overflow: 'hidden' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ position: 'relative', height: 520, overflow: 'hidden', borderRadius: 4, cursor: 'pointer' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s ease', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#111' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,58,208,0.92) 0%, rgba(0,58,208,0.55) 32%, transparent 62%)' }} />

        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', gap: 8 }}>
          <span style={{ background: '#95ff03', color: '#003ad0', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6 }}>Top Story</span>
          <span style={{ background: '#003ad0', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6 }}>{flag} {name}</span>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={11} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', color: hov ? 'var(--green)' : '#fff', marginBottom: 14, maxWidth: 760, transition: 'color .2s' }}>
            {title}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: 640 }}>{text}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            Read article →
          </div>
        </div>
      </div>
    </Link>
  )
}

function SecondaryCard({ article, flag, name }: { article: Article; flag: string; name: string }) {
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }}>
      <div className="cp-card cp-img" style={{ borderRadius: 6, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}>
        <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: '#111' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        </div>
        <div style={{ padding: '16px 18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--tag-text)', background: 'var(--tag-bg)', padding: '3px 7px', borderRadius: 4, border: '1px solid var(--border)' }}>{flag} {name}</span>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--green-text)' }} />
            <span style={{ fontSize: 10, color: 'var(--green-text)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h3 className="cp-title" style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

function GridCard({ article, flag }: { article: Article; flag: string }) {
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }}>
      <div className="cp-card cp-img" style={{ borderRadius: 6, overflow: 'hidden', background: 'var(--bg-card-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
        <div style={{ height: 165, overflow: 'hidden', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: '#111' }} />
          }
        </div>
        <div style={{ padding: '13px 15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--tag-text)', background: 'var(--tag-bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{flag}</span>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--green-text)' }} />
            <span style={{ fontSize: 9, color: 'var(--green-text)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h3 className="cp-title" style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
