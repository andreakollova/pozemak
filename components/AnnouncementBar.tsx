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
    const iv = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  if (!visible || !article) return null

  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--announcement-from) 0%, var(--announcement-to) 50%, var(--announcement-from) 100%)',
      borderBottom: '1px solid var(--announcement-border)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 38, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'var(--green)', color: '#000',
          fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 4,
        }}>
          <Zap size={9} fill="#000" /> Nové
        </span>

        <div style={{ width: 1, height: 14, background: 'var(--announcement-border)', flexShrink: 0 }} />

        <Link href={`/article/${slug}`} style={{
          flex: 1, overflow: 'hidden',
          textDecoration: 'none',
          fontSize: 12, fontWeight: 600,
          color: 'var(--announcement-text)',
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          letterSpacing: 0.3,
          transition: 'color .15s',
        }}
          onMouseEnter={(e: any) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e: any) => (e.currentTarget.style.color = 'var(--announcement-text)')}
        >
          {title}
        </Link>

        <button
          onClick={() => { setVisible(false); sessionStorage.setItem('announcement-hidden', '1') }}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--announcement-text)', opacity: 0.4, padding: 4, display: 'flex', alignItems: 'center', transition: 'opacity .15s' }}
          onMouseEnter={(e: any) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e: any) => (e.currentTarget.style.opacity = '0.4')}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
