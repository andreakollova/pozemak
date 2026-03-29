'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getArticles, getTitle, getSlug, Article } from '@/lib/supabase'
import { Zap, X } from 'lucide-react'

export default function AnnouncementBar() {
  const [article, setArticle] = useState<Article | null>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hidden = sessionStorage.getItem('announcement-hidden')
    if (hidden) { setVisible(false); return }

    const load = () =>
      getArticles(1).then(([a]) => { if (a) setArticle(a) })

    load()
    const iv = setInterval(load, 5 * 60 * 1000) // refresh every 5 min
    return () => clearInterval(iv)
  }, [])

  if (!visible || !article) return null

  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <div style={{
      background: 'linear-gradient(90deg, #003d1f 0%, #005a2c 40%, #003d1f 100%)',
      borderBottom: '1px solid rgba(0,255,135,0.25)',
      position: 'sticky', top: 0, zIndex: 101,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 38, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* Badge */}
        <span style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#00FF87', color: '#000',
          fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 4,
        }}>
          <Zap size={9} fill="#000" /> Nové
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 14, background: 'rgba(0,255,135,0.3)', flexShrink: 0 }} />

        {/* Title link */}
        <Link href={`/article/${slug}`} style={{
          flex: 1, overflow: 'hidden',
          textDecoration: 'none',
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          letterSpacing: 0.3,
          transition: 'color .15s',
        }}
          onMouseEnter={(e: any) => (e.currentTarget.style.color = '#00FF87')}
          onMouseLeave={(e: any) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
        >
          {title}
        </Link>

        {/* Close */}
        <button
          onClick={() => { setVisible(false); sessionStorage.setItem('announcement-hidden', '1') }}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex', alignItems: 'center', transition: 'color .15s' }}
          onMouseEnter={(e: any) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e: any) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
