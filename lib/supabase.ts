import { createClient } from '@supabase/supabase-js'

export type Article = {
  id: string
  url: string
  title: string
  text: string
  image_url: string
  scraped_at: string
}

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
    .order('scraped_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export function getSlug(article: Article): string {
  return article.url.split('/').filter(Boolean).pop() || article.id
}
