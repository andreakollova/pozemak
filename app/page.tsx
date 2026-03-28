'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getArticles, Article } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles(20).then(data => {
      setArticles(data)
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
            Načítavam správy…
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
    </main>
  )
}
