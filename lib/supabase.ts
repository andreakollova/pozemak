import { createClient } from '@supabase/supabase-js'

export type Video = {
  id: string
  youtube_id: string
  title: string
  title_sk: string | null
  thumbnail_url: string
  youtube_url: string
  category: 'dames' | 'heren'
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

// Helpers — vždy vráti slovenský text ak existuje, inak originál
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
  if (error) throw error
  return data || []
}

export function getSlug(article: Article): string {
  return article.url.split('/').filter(Boolean).pop() || article.id
}

export async function getVideos(category?: 'dames' | 'heren', limit = 20): Promise<Video[]> {
  let query = getSupabaseClient()
    .from('videos')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
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
