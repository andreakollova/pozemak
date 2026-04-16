'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getVideos, Video, getVideoTitle } from '@/lib/supabase'
import { Play } from 'lucide-react'

type Category = 'all' | 'dames' | 'heren' | 'fih'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>('all')

  useEffect(() => {
    setLoading(true)
    getVideos(category === 'all' ? undefined : category, 40)
      .then(data => { setVideos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  const tabs: { key: Category; label: string }[] = [
    { key: 'all',   label: 'All' },
    { key: 'dames', label: 'Hoofdklasse Women' },
    { key: 'heren', label: 'Hoofdklasse Men' },
    { key: 'fih',   label: 'FIH' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '25px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>
          Videos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Discover top plays and unforgettable moments from field hockey matches around the world.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            style={{
              padding: '8px 18px', borderRadius: 4, border: 'none',
              background: category === tab.key ? 'var(--green)' : 'var(--bg-card)',
              color: category === tab.key ? '#000' : 'var(--text-secondary)',
              fontWeight: category === tab.key ? 800 : 500,
              fontSize: 13, cursor: 'pointer',
              letterSpacing: category === tab.key ? 0.5 : 0,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      ) : videos.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No videos yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {videos.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
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
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        borderRadius: 6, overflow: 'hidden',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        cursor: 'pointer',
      }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#111' }}>
          <img
            src={video.thumbnail_url}
            alt={getVideoTitle(video)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s' }}
          />
          {/* Play overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: hovered ? 'var(--green)' : 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
              <Play size={20} fill={hovered ? '#000' : '#fff'} color={hovered ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
          {/* Category badge */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            borderRadius: 6, padding: '3px 8px',
            fontSize: 11, fontWeight: 700, color: 'var(--green)',
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {video.category === 'dames' ? 'Women' : video.category === 'heren' ? 'Men' : video.category === 'fih-mens' ? 'FIH Men' : video.category === 'fih-womens' ? 'FIH Women' : 'FIH'}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <p style={{
            fontSize: 14, fontWeight: 700, color: hovered ? 'var(--accent)' : 'var(--text-primary)',
            lineHeight: 1.4, transition: 'color 0.2s',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {getVideoTitle(video)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {new Date(video.published_at).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
    </a>
  )
}
