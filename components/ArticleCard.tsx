'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article, getSlug, getTitle, getText } from '@/lib/supabase'
import { ArrowUpRight } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const excerpt = getText(article)?.slice(0, 160).trim() + '…'

  if (featured) {
    return (
      <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          className="glass"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: hovered ? 'translateY(-4px)' : 'none',
            boxShadow: hovered ? '0 20px 60px rgba(0,255,135,0.12)' : '0 0 0 transparent',
          }}
        >
          {/* Image */}
          {article.image_url && (
            <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
              <img
                src={article.image_url}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                  transform: hovered ? 'scale(1.03)' : 'scale(1)',
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.3) 60%, transparent 100%)',
              }} />
              {/* Featured badge */}
              <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: 'var(--green)',
                color: '#000',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: 4,
              }}>
                Hlavná správa
              </div>
            </div>
          )}
          {/* Content */}
          <div style={{ padding: '28px 32px 32px' }}>
            <p style={{ fontSize: 12, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
              {formatDate(article.scraped_at)}
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
              marginBottom: 14,
            }}>
              {title}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {excerpt}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 20,
              color: 'var(--green)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Čítať <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Regular card
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 16px 40px rgba(0,255,135,0.1)' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        {article.image_url && (
          <div style={{ height: 200, overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={article.image_url}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>
        )}
        {/* Content */}
        <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 11, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 17,
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.3px',
            color: 'var(--text-primary)',
            flex: 1,
          }}>
            {title}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 16,
            color: 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Čítať <ArrowUpRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  )
}
