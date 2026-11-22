import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DRIVE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,200}$/

function safeBaseName(value: string | null): string {
  const cleaned = (value || 'foto')
    .normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  return cleaned || 'foto'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  if (!DRIVE_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Identificador de foto inválido.' }, { status: 400 })
  }

  try {
    const url = new URL('https://drive.google.com/uc')
    url.searchParams.set('export', 'download')
    url.searchParams.set('id', id)
    const upstream = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CCCNGallery/1.0)' },
    })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Não foi possível baixar a foto do Google Drive.' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type')?.split(';')[0] || 'application/octet-stream'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'O Google Drive não retornou uma imagem para este arquivo.' }, { status: 502 })
    }

    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/heic': 'heic',
      'image/heif': 'heif',
      'image/tiff': 'tif',
      'image/bmp': 'bmp',
    }
    const extension = extensionByType[contentType] || 'jpg'
    const filename = `${safeBaseName(searchParams.get('name'))}.${extension}`

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Falha ao obter a foto do Google Drive.' }, { status: 502 })
  }
}
