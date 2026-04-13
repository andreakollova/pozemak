import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getSession } from '@/lib/session'
import * as fs from 'fs'
import * as path from 'path'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Build the Instagram caption from article text
function buildCaption(titleSk: string, textSk: string): string {
  // Split into sentences
  const sentences = textSk
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  const first = sentences[0] ?? titleSk
  const rest  = sentences.slice(1, 6).join(' ')

  return [
    `🇳🇱 Holandsko - ${first}`,
    rest,
    'Originál článku / kredit: HockeyNL',
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
    .from('instagram')
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  const { data } = db.storage.from('instagram').getPublicUrl(filename)
  return data.publicUrl
}

// Post image to Instagram via Meta Graph API
async function postToInstagram(imageUrl: string, caption: string): Promise<string> {
  const token     = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID
  if (!token || !accountId) throw new Error('Instagram credentials not set')

  const base = `https://graph.facebook.com/v18.0/${accountId}`

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
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${token}`
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
    // Load template.png from /public
    const templatePath = path.join(process.cwd(), 'public', 'template.png')
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

    const caption    = buildCaption(titleSk, textSk)
    const imageUrl   = await uploadToStorage(compositeBuffer)
    const mediaId    = await postToInstagram(imageUrl, caption)

    return NextResponse.json({ success: true, mediaId })
  } catch (err: any) {
    console.error('[Instagram post error]', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
