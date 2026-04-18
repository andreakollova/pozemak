import type { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // rebuild sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.hockeyrefresh.com'

  // Static routes
  const statics: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${base}/videos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/competition`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/netherlands`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/great-britain`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/australia`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/germany`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/belgium`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/spain`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/argentina`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/ireland`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/scotland`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/india`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ]

  // Article routes
  try {
    const db = getSupabaseAdmin()
    const { data } = await db
      .from('articles')
      .select('url, scraped_at')
      .eq('published', true)
      .order('scraped_at', { ascending: false })
      .limit(1000)

    const articles: MetadataRoute.Sitemap = (data || []).map((a) => {
      const slug = (a.url || '').replace(/\/$/, '').split('/').pop() || ''
      return {
        url: `${base}/article/${slug}`,
        lastModified: a.scraped_at ? new Date(a.scraped_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }
    }).filter(a => a.url !== `${base}/article/`)

    return [...statics, ...articles]
  } catch {
    return statics
  }
}
