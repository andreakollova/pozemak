'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'

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
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTop: '2px solid var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  const featured = articles[0]
  const sideNews  = articles.slice(1, 4)
  const gridNews  = articles.slice(4, 10)

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 100px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a { color: inherit; }
        .hero-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2px; }
        .news-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .news-grid  { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .news-grid { grid-template-columns: 1fr; }
        }
        .card-img { overflow: hidden; }
        .card-img img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .story-card:hover .card-img img { transform: scale(1.04); }
        .story-card:hover .card-title { color: var(--green) !important; }
      `}</style>

      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--text-primary)', paddingBottom: 10, marginBottom: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Správy
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 1 }}>
          {formatDate(new Date().toISOString())}
        </span>
      </div>

      {/* ── Hero + side ── */}
      {featured && (
        <div className="hero-grid" style={{ marginBottom: 2 }}>
          {/* Big featured */}
          <Link href={`/article/${getSlug(featured)}`} style={{ textDecoration: 'none' }}>
            <div className="story-card" style={{ background: 'var(--card-bg, rgba(255,255,255,0.02))', borderRight: '1px solid var(--border)', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="card-img" style={{ height: 420 }}>
                {featured.image_url && <img src={featured.image_url} alt={getTitle(featured)} />}
              </div>
              <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '3px solid var(--green)' }}>
                <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>
                  Hlavná správa · {formatDate(featured.scraped_at)}
                </span>
                <h2 className="card-title" style={{ fontSize: 'clamp(20px, 2.2vw, 30px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 14, transition: 'color 0.2s' }}>
                  {getTitle(featured)}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
                  {(getText(featured) || '').slice(0, 220).trim()}…
                </p>
              </div>
            </div>
          </Link>

          {/* Side column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sideNews.map((a, i) => (
              <Link key={a.id} href={`/article/${getSlug(a)}`} style={{ textDecoration: 'none', flex: 1 }}>
                <div className="story-card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', borderBottom: i < sideNews.length - 1 ? '1px solid var(--border)' : 'none', background: 'rgba(255,255,255,0.015)' }}>
                  <div className="card-img" style={{ height: 160 }}>
                    {a.image_url && <img src={a.image_url} alt={getTitle(a)} />}
                  </div>
                  <div style={{ padding: '14px 18px 16px', flex: 1, borderTop: '2px solid var(--border)' }}>
                    <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
                      {formatDate(a.scraped_at)}
                    </span>
                    <h3 className="card-title" style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {getTitle(a)}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── More articles ── */}
      {gridNews.length > 0 && (
        <>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, marginTop: 32, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Ďalšie správy</span>
          </div>
          <div className="news-grid">
            {gridNews.map((a) => (
              <Link key={a.id} href={`/article/${getSlug(a)}`} style={{ textDecoration: 'none' }}>
                <div className="story-card" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.015)', borderRight: '1px solid var(--border)' }}>
                  <div className="card-img" style={{ height: 180 }}>
                    {a.image_url && <img src={a.image_url} alt={getTitle(a)} />}
                  </div>
                  <div style={{ padding: '14px 16px 18px', borderTop: '2px solid var(--border)' }}>
                    <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
                      {formatDate(a.scraped_at)}
                    </span>
                    <h3 className="card-title" style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {getTitle(a)}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Video carousels ── */}
      {damesVideos.length > 0 && <VideoCarousel title="Hoofdklasse Dames" videos={damesVideos} />}
      {herenVideos.length > 0 && <VideoCarousel title="Hoofdklasse Heren" videos={herenVideos} />}
    </main>
  )
}

/* ─── Video carousel ─────────────────────────────────────────────────────── */
function VideoCarousel({ title, videos }: { title: string; videos: Video[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/videos" style={{ fontSize: 11, color: 'var(--green)', letterSpacing: 1, textDecoration: 'none', fontWeight: 700 }}>
            Všetky →
          </Link>
          {(['left', 'right'] as const).map(dir => (
            <button key={dir} onClick={() => scroll(dir)} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dir === 'left' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} style={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', flexShrink: 0, width: 240 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ background: 'rgba(255,255,255,0.015)', cursor: 'pointer' }}>
        <div style={{ position: 'relative', width: '100%', height: 135, overflow: 'hidden', background: '#111' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: hovered ? 'var(--green)' : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
              <Play size={14} fill={hovered ? '#000' : '#fff'} color={hovered ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 12px 13px', borderTop: '2px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: hovered ? 'var(--green)' : 'var(--text-primary)', lineHeight: 1.4, transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
