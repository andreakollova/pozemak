'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getArticles, Article, getTitle } from '@/lib/supabase'
import { Plus, LogOut, Pencil, ExternalLink, Star, Users, Eye, TrendingUp } from 'lucide-react'

type Period = '7d' | '30d' | '90d'

type AnalyticsData = {
  stats: {
    visitors:    { value: number; change?: number }
    pageViews:   { value: number; change?: number }
    bounceRate?: { value: number; change?: number }
  }
  paths: { path: string; count: number }[]
} | null

export default function AdminDashboard() {
  const router = useRouter()
  const [articles, setArticles]     = useState<Article[]>([])
  const [loading, setLoading]       = useState(true)
  const [isLight, setIsLight]       = useState(false)
  const [period, setPeriod]         = useState<Period>('7d')
  const [analytics, setAnalytics]   = useState<AnalyticsData>(null)
  const [aLoading, setALoading]     = useState(true)
  const [aError, setAError]         = useState('')

  useEffect(() => {
    setIsLight(document.body.classList.contains('light'))
    getArticles(50).then(data => { setArticles(data); setLoading(false) })
  }, [])

  useEffect(() => {
    setALoading(true)
    setAError('')
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setAError(data.error); setAnalytics(null) }
        else setAnalytics(data)
        setALoading(false)
      })
      .catch(() => { setAError('Failed to load analytics'); setALoading(false) })
  }, [period])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const accent = isLight ? 'var(--blue)' : 'var(--green)'

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>
          Admin <span style={{ color: accent }}>panel</span>
        </h1>
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
            background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* ── Analytics ── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Analytics
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['7d', '30d', '90d'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
                background: period === p ? accent : 'var(--bg-card)',
                color: period === p ? (isLight ? '#fff' : '#000') : 'var(--text-secondary)',
              }}>
                {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>

        {aLoading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading analytics…</p>
        ) : aError ? (
          <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)' }}>
            <p style={{ fontSize: 13, color: '#ff6b6b', margin: 0 }}>
              {aError.includes('not set')
                ? 'Add VERCEL_TOKEN and VERCEL_PROJECT_ID to Vercel env vars to enable analytics.'
                : aError}
            </p>
          </div>
        ) : analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 12 }}>
            {/* Visitors */}
            <StatCard
              icon={<Users size={16} />}
              label="Visitors"
              value={analytics.stats?.visitors?.value ?? 0}
              change={analytics.stats?.visitors?.change}
              accent={accent}
            />
            {/* Page views */}
            <StatCard
              icon={<Eye size={16} />}
              label="Page views"
              value={analytics.stats?.pageViews?.value ?? 0}
              change={analytics.stats?.pageViews?.change}
              accent={accent}
            />
            {/* Bounce rate */}
            <StatCard
              icon={<TrendingUp size={16} />}
              label="Bounce rate"
              value={analytics.stats?.bounceRate?.value ?? 0}
              change={analytics.stats?.bounceRate?.change}
              accent={accent}
              suffix="%"
            />
            {/* Top pages */}
            <div className="glass" style={{ borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px' }}>Top pages</p>
              {(analytics.paths ?? []).slice(0, 5).map((p, i) => (
                <div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                    <span style={{ color: accent, marginRight: 6, fontWeight: 700 }}>{i + 1}.</span>
                    {p.path}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{p.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Article list ── */}
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>
        Articles
      </p>
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
                  {a.top_story && <Star size={12} fill="#FFC107" color="#FFC107" style={{ flexShrink: 0 }} />}
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
                    background: 'transparent', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  }}>
                    <Pencil size={12} /> Edit
                  </button>
                </Link>
                <a href={`/article/${a.url.split('/').filter(Boolean).pop()}`} target="_blank" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
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

function StatCard({ icon, label, value, change, accent, suffix = '' }: {
  icon: React.ReactNode; label: string; value: number; change?: number; accent: string; suffix?: string
}) {
  const positive = (change ?? 0) >= 0
  return (
    <div className="glass" style={{ borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text-secondary)' }}>
        {icon}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>{label}</p>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
        {value.toLocaleString()}{suffix}
      </p>
      {change !== undefined && (
        <p style={{ fontSize: 12, color: positive ? '#4ade80' : '#f87171', marginTop: 4, fontWeight: 600 }}>
          {positive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs prev period
        </p>
      )}
    </div>
  )
}
