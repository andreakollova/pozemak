import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getSession } from '@/lib/session'
import * as fs from 'fs'
import * as path from 'path'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import webpush from 'web-push'

function creditFor(sourceUrl: string): string {
  if (sourceUrl.includes('greatbritainhockey') || sourceUrl.includes('hockeyengland')) return '📸 Credit: GB Hockey / Hockey England'
  if (sourceUrl.includes('hockey.ie'))         return '📸 Credit: Hockey Ireland'
  if (sourceUrl.includes('scottish-hockey'))   return '📸 Credit: Scottish Hockey'
  if (sourceUrl.includes('hockey.org.au'))     return '📸 Credit: Hockey Australia'
  if (sourceUrl.includes('eshockey.es'))       return '📸 Credit: Real Federación Española de Hockey'
  if (sourceUrl.includes('cahockey.org.ar'))   return '📸 Credit: Confederación Argentina de Hockey'
  if (sourceUrl.includes('hockey.de'))         return '📸 Credit: Deutscher Hockey-Bund'
  if (sourceUrl.includes('hockey.be'))         return '📸 Credit: Royal Belgian Hockey Association'
  if (sourceUrl.includes('hockeyindia'))       return '📸 Credit: Hockey India'
  if (sourceUrl.includes('eurohockey.org'))    return '📸 Credit: EuroHockey'
  if (sourceUrl.includes('fih.hockey'))        return '📸 Credit: FIH Hockey'
  return '📸 Credit: HockeyNL'
}

function countryLabel(sourceUrl: string): string {
  if (sourceUrl.includes('greatbritainhockey') || sourceUrl.includes('hockeyengland')) return '🇬🇧 Veľká Británia'
  if (sourceUrl.includes('hockey.ie'))         return '🇮🇪 Írsko'
  if (sourceUrl.includes('scottish-hockey'))   return '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Škótsko'
  if (sourceUrl.includes('hockey.org.au'))     return '🇦🇺 Austrália'
  if (sourceUrl.includes('eshockey.es'))       return '🇪🇸 Španielsko'
  if (sourceUrl.includes('cahockey.org.ar'))   return '🇦🇷 Argentína'
  if (sourceUrl.includes('hockey.de'))         return '🇩🇪 Nemecko'
  if (sourceUrl.includes('hockey.be'))         return '🇧🇪 Belgicko'
  if (sourceUrl.includes('hockeyindia'))       return '🇮🇳 India'
  if (sourceUrl.includes('eurohockey.org'))    return '🌍 EuroHockey'
  if (sourceUrl.includes('fih.hockey'))        return '🌍 FIH'
  return '🇳🇱 Holandsko'
}

// Build the Instagram caption from article text
function buildCaption(titleSk: string, textSk: string, sourceUrl: string): string {
  const sentences = textSk
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  const first = sentences[0] ?? titleSk
  const rest  = sentences.slice(1, 6).join(' ')

  return [
    `${countryLabel(sourceUrl)} - ${first}`,
    rest,
    creditFor(sourceUrl),
    'Viac o novinkách zo sveta pozemného hokeja sa dočítate na pozemak.sk.',
    '#fieldhockey',
  ]
    .filter(Boolean)
    .join('\n\n')
}

// Download a URL and return a Buffer
async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// Upload image bytes to Supabase Storage and return the public URL
async function uploadToStorage(imageBuffer: Buffer): Promise<string> {
  const db = getSupabaseAdmin()
  const filename = `ig-${Date.now()}.jpg`
  const { error } = await db.storage
    .from('instagram-images')
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  const { data } = db.storage.from('instagram-images').getPublicUrl(filename)
  return data.publicUrl
}

// Post image to Instagram via Meta Graph API
async function postToInstagram(imageUrl: string, caption: string): Promise<string> {
  const token     = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID
  if (!token || !accountId) throw new Error('Instagram credentials not set')

  const base = `https://graph.facebook.com/v21.0/${accountId}`

  // 1. Create media container
  const createRes = await fetch(
    `${base}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${token}`,
    { method: 'POST' }
  )
  const createData = await createRes.json()
  if (!createData.id) throw new Error(`Container creation failed: ${JSON.stringify(createData)}`)
  const containerId = createData.id

  // 2. Wait for container to be ready
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${token}`
    )
    const { status_code } = await statusRes.json()
    if (status_code === 'FINISHED') break
    if (status_code === 'ERROR') throw new Error('Instagram container processing failed')
  }

  // 3. Publish
  const publishRes = await fetch(
    `${base}/media_publish?creation_id=${containerId}&access_token=${token}`,
    { method: 'POST' }
  )
  const publishData = await publishRes.json()
  if (!publishData.id) throw new Error(`Publish failed: ${JSON.stringify(publishData)}`)
  return publishData.id
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const session = await getSession()
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = getSupabaseAdmin()

  // Fetch article
  const { data: article, error } = await db
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const titleSk = article.title_sk || article.title
  const textSk  = article.text_sk  || article.text

  try {
    // Pick the right template based on article source URL
    const sourceUrl = article.url || ''
    const templateFile = (() => {
      if (sourceUrl.includes('greatbritainhockey') || sourceUrl.includes('hockeyengland')) return 'template-gbr.png'
      if (sourceUrl.includes('hockey.ie'))          return 'template-ireland.png'
      if (sourceUrl.includes('scottish-hockey'))    return 'template-scotland.png'
      if (sourceUrl.includes('hockey.org.au'))      return 'template-australia.png'
      if (sourceUrl.includes('eshockey.es'))        return 'template-spain.png'
      if (sourceUrl.includes('cahockey.org.ar'))    return 'template-argentina.png'
      if (sourceUrl.includes('hockey.de'))          return 'template-germany.png'
      if (sourceUrl.includes('hockey.be'))          return 'template-belgium.png'
      if (sourceUrl.includes('hockeyindia'))        return 'template-india.png'
      if (sourceUrl.includes('eurohockey.org'))     return 'template-worldwide.png'
      if (sourceUrl.includes('fih.hockey'))         return 'template-worldwide.png'
      return 'template.png'
    })()
    const templatePath = path.join(process.cwd(), 'public', templateFile)
    const templateBuffer = fs.readFileSync(templatePath)

    // Create composite: article thumbnail as background, template overlay on top
    let compositeBuffer: Buffer

    if (article.image_url) {
      const thumbBuffer = await fetchBuffer(article.image_url)

      // Resize thumbnail to full canvas (1080×1350), then overlay template
      compositeBuffer = await sharp(thumbBuffer)
        .resize(1080, 1350, { fit: 'cover', position: 'centre' })
        .composite([{ input: templateBuffer, gravity: 'centre' }])
        .jpeg({ quality: 92 })
        .toBuffer()
    } else {
      // No thumbnail — just use template as-is
      compositeBuffer = await sharp(templateBuffer)
        .resize(1080, 1350, { fit: 'contain', background: { r: 8, g: 8, b: 8, alpha: 1 } })
        .jpeg({ quality: 92 })
        .toBuffer()
    }

    const caption    = buildCaption(titleSk, textSk, sourceUrl)
    const imageUrl   = await uploadToStorage(compositeBuffer)
    const mediaId    = await postToInstagram(imageUrl, caption)

    // Send push notification to subscribers
    try {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!,
      )
      const { data: subs } = await db.from('push_subscriptions').select('subscription')
      if (subs?.length) {
        const slug = (article.url || '').split('/').filter(Boolean).pop() || id
        const payload = JSON.stringify({
          title: '🏑 Hockey Refresh',
          body: titleSk || article.title || 'New article',
          url: `/article/${slug}`,
        })
        await Promise.all(subs.map(async (row) => {
          try { await webpush.sendNotification(JSON.parse(row.subscription), payload) } catch {}
        }))
      }
    } catch (e) {
      console.error('Push notification failed:', e)
    }

    return NextResponse.json({ success: true, mediaId })
  } catch (err: any) {
    console.error('[Instagram post error]', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
