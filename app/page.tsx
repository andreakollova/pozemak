'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getArticles(20),
      getVideos('dames', 10),
      getVideos('heren', 10),
    ]).then(([arts, dames, heren]) => {
      setArticles(arts)
      setDamesVideos(dames)
      setHerenVideos(heren)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, border: '3px solid var(--border)',
            borderTop: '3px solid var(--green)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-secondary)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>Načítavam…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  const featured  = articles[0]
  const sideNews  = articles.slice(1, 4)   // 3 vedľajšie správy
  const gridNews  = articles.slice(4, 10)  // 6 ďalších článkov (2 rady po 3)

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── HERO sekcia ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 4, height: 28, background: 'var(--green)', borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Najnovšie správy
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* Hlavný banner */}
        {featured && <FeaturedCard article={featured} />}

        {/* Vedľajšie správy — stĺpec */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sideNews.map(a => <SideCard key={a.id} article={a} />)}
        </div>
      </div>

      {/* ── GRID ďalších článkov ── */}
      {gridNews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 8 }}>
          {gridNews.map(a => <GridCard key={a.id} article={a} />)}
        </div>
      )}

      {articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🏑</p>
          <p>Zatiaľ žiadne správy.</p>
        </div>
      )}

      {/* ── VIDEO karusely ── */}
      {damesVideos.length > 0 && (
        <VideoCarousel title="Hoofdklasse" accent="Dames" videos={damesVideos} />
      )}
      {herenVideos.length > 0 && (
        <VideoCarousel title="Hoofdklasse" accent="Heren" videos={herenVideos} />
      )}

    </main>
  )
}

/* ── Featured card (veľký banner) ─────────────────────────────────────────── */
function FeaturedCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const excerpt = getText(article)?.slice(0, 180).trim() + '…'

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 20, overflow: 'hidden', cursor: 'pointer', height: '100%',
          transition: 'transform 0.3s, box-shadow 0.3s',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 20px 60px rgba(0,255,135,0.12)' : 'none',
        }}
      >
        {article.image_url && (
          <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
            <img src={article.image_url} alt={title} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s', transform: hovered ? 'scale(1.03)' : 'scale(1)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.2) 60%, transparent 100%)',
            }} />
            <div style={{
              position: 'absolute', top: 20, left: 20,
              background: 'var(--green)', color: '#000',
              fontSize: 11, fontWeight: 800, letterSpacing: 2,
              textTransform: 'uppercase', padding: '4px 12px', borderRadius: 4,
            }}>Hlavná správa</div>
          </div>
        )}
        <div style={{ padding: '24px 28px 28px' }}>
          <p style={{ fontSize: 11, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: 12 }}>
            {title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{excerpt}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, color: 'var(--green)', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Čítať <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Side card (malá správa v stĺpci) ─────────────────────────────────────── */
function SideCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 14, overflow: 'hidden', cursor: 'pointer', height: '100%',
          display: 'flex', alignItems: 'stretch',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: hovered ? 'translateY(-2px)' : 'none',
          boxShadow: hovered ? '0 8px 30px rgba(0,255,135,0.08)' : 'none',
        }}
      >
        {/* Obrázok */}
        {article.image_url && (
          <div style={{ width: 90, flexShrink: 0, overflow: 'hidden' }}>
            <img src={article.image_url} alt={title} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }} />
          </div>
        )}
        {/* Text */}
        <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 13, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

/* ── Grid card (bežná karta) ───────────────────────────────────────────────── */
function GridCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: hovered ? 'translateY(-3px)' : 'none',
          boxShadow: hovered ? '0 12px 40px rgba(0,255,135,0.1)' : 'none',
        }}
      >
        {article.image_url && (
          <div style={{ height: 180, overflow: 'hidden' }}>
            <img src={article.image_url} alt={title} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }} />
          </div>
        )}
        <div style={{ padding: '16px 18px 20px' }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 15, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {title}
          </h3>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            Čítať <ArrowUpRight size={11} />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Video carousel ────────────────────────────────────────────────────────── */
function VideoCarousel({ title, accent, videos }: { title: string; accent: string; videos: Video[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  return (
    <div style={{ marginTop: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 4, height: 28, background: 'var(--green)', borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {title} <span style={{ color: 'var(--green)' }}>{accent}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/videos" style={{ textDecoration: 'none', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}
            onMouseEnter={(e: any) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e: any) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >Všetky videá →</Link>
          <button onClick={() => scroll('left')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', flexShrink: 0, width: 260 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', transition: 'transform 0.2s', transform: hovered ? 'translateY(-3px)' : 'none' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111', overflow: 'hidden' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transition: 'transform 0.3s', transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: hovered ? 'var(--green)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
              <Play size={16} fill={hovered ? '#000' : '#fff'} color={hovered ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
