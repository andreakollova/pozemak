import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getSession } from '@/lib/session'
import * as fs from 'fs'
import * as path from 'path'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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
  if (sourceUrl.includes('englandhockey.co.uk')) return '📸 Credit: England Hockey'
  if (sourceUrl.includes('hockeywales.org.uk'))  return '📸 Credit: Hockey Wales'
  if (sourceUrl.includes('hockey.com.uy'))       return '📸 Credit: Uruguay Hockey'
  if (sourceUrl.includes('hockeynz.co.nz'))      return '📸 Credit: Hockey New Zealand'
  if (sourceUrl.includes('fieldhockey.ca'))      return '📸 Credit: Field Hockey Canada'
  return '📸 Credit: HockeyNL'
}

function countryLabel(sourceUrl: string): string {
  if (sourceUrl.includes('greatbritainhockey') || sourceUrl.includes('hockeyengland')) return '🇬🇧 Great Britain'
  if (sourceUrl.includes('hockey.ie'))         return '🇮🇪 Ireland'
  if (sourceUrl.includes('scottish-hockey'))   return '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland'
  if (sourceUrl.includes('hockey.org.au'))     return '🇦🇺 Australia'
  if (sourceUrl.includes('eshockey.es'))       return '🇪🇸 Spain'
  if (sourceUrl.includes('cahockey.org.ar'))   return '🇦🇷 Argentina'
  if (sourceUrl.includes('hockey.de'))         return '🇩🇪 Germany'
  if (sourceUrl.includes('hockey.be'))         return '🇧🇪 Belgium'
  if (sourceUrl.includes('hockeyindia'))       return '🇮🇳 India'
  if (sourceUrl.includes('eurohockey.org'))    return '🌍'
  if (sourceUrl.includes('fih.hockey'))        return '🌍'
  if (sourceUrl.includes('englandhockey.co.uk')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England'
  if (sourceUrl.includes('hockeywales.org.uk'))  return '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales'
  if (sourceUrl.includes('hockey.com.uy'))       return '🇺🇾 Uruguay'
  if (sourceUrl.includes('hockeynz.co.nz'))      return '🇳🇿 New Zealand'
  if (sourceUrl.includes('fieldhockey.ca'))      return '🇨🇦 Canada'
  return '🇳🇱 Netherlands'
}

const PARA_EMOJIS = ['🏑', '⚡', '💪', '🔥', '🎯', '🌍', '🏆', '💥', '🚀', '👊']
const SUBHEAD_EMOJI_RE = /^[\u{1F300}-\u{1FAFF}]\s*(.{1,80})$/u

function igLen(s: string): number {
  let n = 0
  for (const c of s) n += c.codePointAt(0)! > 0xFFFF ? 2 : 1
  return n
}

// Build the Instagram caption from article text — same structure as the Discord bot
function buildCaption(titleSk: string, textSk: string, sourceUrl: string): string {
  const label = countryLabel(sourceUrl)
  const header = `${label} ${titleSk}`
  const credit = creditFor(sourceUrl)
  const footer = `${credit}\n\n👀 For more hockey news check out hockeyrefresh.com`
  const IG_LIMIT = 2190

  // Convert emoji-prefixed subheadings to "Heading -" then flatten
  const markedBody = textSk.split('\n\n').map(para => {
    const p = para.trim()
    const m = p.match(SUBHEAD_EMOJI_RE)
    if (m && !p.includes('.') && !p.includes('!') && !p.includes('?')) {
      return (m[1] || '').trim() + ' -'
    }
    return para
  }).join('\n\n')

  const flat = markedBody
    .replace(/[\u{1F300}-\u{1FAFF}]\s*/gu, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const sentences = flat.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean).slice(0, 10)
  if (!sentences.length) sentences.push(titleSk)

  const chunks = []
  for (let i = 0; i < sentences.length; i += 4) {
    chunks.push(`${PARA_EMOJIS[chunks.length % PARA_EMOJIS.length]} ${sentences.slice(i, i + 4).join(' ')}`)
  }

  const hashtag = '#fieldhockey'
  const parts: string[] = [header]
  let used = igLen(header) + 2 + igLen(hashtag) + 2 + igLen(footer)
  for (const chunk of chunks) {
    const extra = igLen('\n\n' + chunk)
    if (used + extra > IG_LIMIT) break
    parts.push(chunk)
    used += extra
  }
  parts.push(hashtag)
  parts.push(footer)

  // Hard safety trim
  let caption = parts.join('\n\n')
  while (igLen(caption) > IG_LIMIT && parts.length > 2) {
    parts.splice(-2, 1)
    caption = parts.join('\n\n')
  }
  return caption
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
  const token     = 'EAATPM4SAfpgBREn4wAqiOO2deoNFXPbBu3LGltw9iyijySv2XqDFpMyZADf9UmbYEIkfpderEmby8Hac2NlfAO9m12ZAFEJ7MBjR2d03ZCHqeZBZAEgDOuQyGn7MlIomvT3YnlZCvIG8h6iWtIacJYHaP0nyvsezKpVdV15VytkX57SdQNduRmWmAe9zImKZCl0ZBUl9QpQCmvcJ' // hockeyrefresh
  const accountId = '17841413427897379' // hockeyrefresh — never change this

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
      if (sourceUrl.includes('eurohockey.org'))       return 'template-worldwide.png'
      if (sourceUrl.includes('fih.hockey'))           return 'template-worldwide.png'
      if (sourceUrl.includes('englandhockey.co.uk'))  return 'template-england.png'
      if (sourceUrl.includes('hockeywales.org.uk'))   return 'template-wales.png'
      if (sourceUrl.includes('hockey.com.uy'))        return 'template-uruguay.png'
      if (sourceUrl.includes('hockeynz.co.nz'))       return 'template-nz.png'
      if (sourceUrl.includes('fieldhockey.ca'))       return 'template-canada.png'
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

    // Send push notification (web + native APNs) via unified send endpoint
    try {
      const slug = (article.url || '').split('/').filter(Boolean).pop() || id
      await fetch('https://www.hockeyrefresh.com/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.PUBLISH_API_KEY! },
        body: JSON.stringify({
          title: '🏑 New Top Story',
          body: titleSk || article.title || 'New article',
          url: `/article/${slug}`,
        }),
      })
    } catch (e) {
      console.error('Push notification failed:', e)
    }

    return NextResponse.json({ success: true, mediaId })
  } catch (err: any) {
    console.error('[Instagram post error]', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
