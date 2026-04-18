import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface Props {
  params: Promise<{ slug: string }>
}

async function fetchArticle(slug: string) {
  try {
    const db = getSupabaseAdmin()
    const { data } = await db
      .from('articles')
      .select('title_sk, title, text_sk, text, image_url, url, scraped_at')
      .ilike('url', `%/${slug}`)
      .eq('published', true)
      .single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticle(slug)

  if (!article) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    }
  }

  const title = article.title_sk || article.title || 'Field Hockey News'
  const bodyText = article.text_sk || article.text || ''
  // First ~160 chars of body text, stripped of emoji/markdown
  const description = bodyText
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 160)
    .trim() || 'Read the latest field hockey news on Hockey Refresh.'

  const canonical = `https://www.hockeyrefresh.com/article/${slug}`
  const image = article.image_url || '/og-image.png'

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: 'Hockey Refresh',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: article.scraped_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await fetchArticle(slug)

  const title = article?.title_sk || article?.title || 'Field Hockey News'
  const bodyText = article?.text_sk || article?.text || ''
  const description = bodyText
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 160)
    .trim() || 'Read the latest field hockey news on Hockey Refresh.'
  const canonical = `https://www.hockeyrefresh.com/article/${slug}`
  const image = article?.image_url || '/og-image.png'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: [image],
    datePublished: article?.scraped_at,
    dateModified: article?.scraped_at,
    author: [{ '@type': 'Organization', name: 'Hockey Refresh', url: 'https://www.hockeyrefresh.com' }],
    publisher: {
      '@type': 'Organization',
      name: 'Hockey Refresh',
      url: 'https://www.hockeyrefresh.com',
      logo: { '@type': 'ImageObject', url: 'https://www.hockeyrefresh.com/logo-dark.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
