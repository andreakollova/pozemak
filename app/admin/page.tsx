'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getArticles, Article, getTitle } from '@/lib/supabase'
import { Plus, LogOut, Pencil, ExternalLink, Star } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles(50).then(data => { setArticles(data); setLoading(false) })
  }, [])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Admin <span style={{ color: 'var(--green)' }}>panel</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Article management</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/admin/article/new" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'var(--green)', color: '#000', fontWeight: 800,
              fontSize: 13, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
            }}>
              <Plus size={15} /> New article
            </button>
          </Link>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: 13,
            cursor: 'pointer',
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Article list */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {articles.map(a => (
            <div key={a.id} className="glass" style={{
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {a.image_url && (
                <img src={a.image_url} alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {a.top_story && (
                    <Star size={12} fill="#FFC107" color="#FFC107" style={{ flexShrink: 0 }} />
                  )}
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getTitle(a)}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {new Date(a.scraped_at).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Link href={`/admin/article/${a.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-primary)', fontSize: 12,
                    cursor: 'pointer', fontWeight: 600,
                  }}>
                    <Pencil size={12} /> Edit
                  </button>
                </Link>
                <a href={`/article/${a.url.split('/').filter(Boolean).pop()}`} target="_blank" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    <ExternalLink size={12} />
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
