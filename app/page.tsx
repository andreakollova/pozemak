'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getVideoTitle } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'

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

  const featured = articles[0]
  const rest = articles.slice(1)

  if (loading) {
    return (
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48,
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--green)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-secondary)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>
            Načítavam…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
        <div style={{ width: 4, height: 32, background: 'var(--green)', borderRadius: 2 }} />
        <h1 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Najnovšie správy
        </h1>
      </div>

      {/* Featured + 2 secondary */}
      {featured && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginBottom: 24,
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <ArticleCard article={featured} featured />
          </div>
          {rest.slice(0, 2).map(a => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '48px 0 32px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 3, textTransform: 'uppercase' }}>
          Všetky správy
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Rest grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {rest.slice(2).map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>

      {articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🏑</p>
          <p>Zatiaľ žiadne správy.</p>
        </div>
      )}

      {/* Video sekcie */}
      {damesVideos.length > 0 && (
        <VideoCarousel title="Hoofdklasse" accent="Dames" videos={damesVideos} />
      )}
      {herenVideos.length > 0 && (
        <VideoCarousel title="Hoofdklasse" accent="Heren" videos={herenVideos} />
      )}

    </main>
  )
}

function VideoCarousel({ title, accent, videos }: { title: string; accent: string; videos: Video[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
    <div style={{ marginTop: 64 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 4, height: 32, background: 'var(--green)', borderRadius: 2 }} />
          <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {title} <span style={{ color: 'var(--green)' }}>{accent}</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/videos" style={{ textDecoration: 'none', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}
            onMouseEnter={(e: any) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e: any) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Všetky videá →
          </Link>
          <button onClick={() => scroll('left')} style={{
            width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><ChevronLeft size={16} /></button>
          <button onClick={() => scroll('right')} style={{
            width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 16, overflowX: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          paddingBottom: 8,
        }}
      >
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', flexShrink: 0, width: 260 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="glass" style={{
        borderRadius: 12, overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s',
      }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111', overflow: 'hidden' }}>
          <img
            src={video.thumbnail_url}
            alt={getVideoTitle(video)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: hovered ? 'var(--green)' : 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
              <Play size={16} fill={hovered ? '#000' : '#fff'} color={hovered ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        {/* Title */}
        <div style={{ padding: '12px 14px' }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
