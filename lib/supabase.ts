import { createClient } from '@supabase/supabase-js'

export type Video = {
  id: string
  youtube_id: string
  title: string
  title_sk: string | null
  thumbnail_url: string
  youtube_url: string
  category: 'dames' | 'heren' | 'fih'
  published_at: string
  scraped_at: string
}

export const getVideoTitle = (v: Video) => v.title_sk || v.title

export type Article = {
  id: string
  url: string
  title: string
  text: string
  title_sk: string | null
  text_sk: string | null
  image_url: string
  scraped_at: string
  published: boolean
}

// Helpers — return English rewrite if available, otherwise fall back to original
export const getTitle = (a: Article) => a.title_sk || a.title
export const getText = (a: Article) => a.text_sk || a.text

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
}

export async function getArticles(limit = 20): Promise<Article[]> {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('scraped_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data || []
}

export function getSlug(article: Article): string {
  return article.url.split('/').filter(Boolean).pop() || article.id
}

export function getArticleSource(article: Article): { flag: string; country: string } {
  const url = article.url
  if (url.includes('greatbritainhockey'))  return { flag: '🇬🇧', country: 'Great Britain' }
  if (url.includes('hockey.ie'))           return { flag: '🇮🇪', country: 'Ireland' }
  if (url.includes('scottish-hockey'))     return { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Scotland' }
  if (url.includes('hockey.org.au'))       return { flag: '🇦🇺', country: 'Australia' }
  if (url.includes('eshockey.es'))         return { flag: '🇪🇸', country: 'Spain' }
  if (url.includes('cahockey.org.ar'))     return { flag: '🇦🇷', country: 'Argentina' }
  if (url.includes('hockey.de'))           return { flag: '🇩🇪', country: 'Germany' }
  if (url.includes('hockey.be'))           return { flag: '🇧🇪', country: 'Belgium' }
  if (url.includes('hockeyindia'))         return { flag: '🇮🇳', country: 'India' }
  return { flag: '🇳🇱', country: 'Netherlands' }
}

export async function getArticlesByDomain(domain: string, limit = 20): Promise<Article[]> {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('*')
    .ilike('url', `%${domain}%`)
    .eq('published', true)
    .order('scraped_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data || []
}

export async function getGBArticles(limit = 20): Promise<Article[]> {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('*')
    .ilike('url', '%greatbritainhockey%')
    .eq('published', true)
    .order('scraped_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data || []
}

export async function getVideos(category?: 'dames' | 'heren' | 'fih', limit = 20): Promise<Video[]> {
  let query = getSupabaseClient()
    .from('videos')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}
