import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DRIVE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,200}$/
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'image/avif': 'avif', 'image/heic': 'heic', 'image/heif': 'heif', 'image/tiff': 'tif', 'image/bmp': 'bmp',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv', 'video/3gpp': '3gp', 'video/mpeg': 'mpeg', 'video/x-ms-wmv': 'wmv',
}

function safeBaseName(value: string | null): string {
  const cleaned = (value || 'arquivo')
    .normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  return cleaned || 'arquivo'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  if (!DRIVE_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Identificador do arquivo inválido.' }, { status: 400 })
  }

  try {
    const url = new URL('https://drive.google.com/uc')
    url.searchParams.set('export', 'download')
    url.searchParams.set('id', id)
    const range = req.headers.get('range')
    const upstream = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CCCNGallery/1.0)',
        ...(range ? { Range: range } : {}),
      },
    })
    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json({ error: 'Não foi possível obter o arquivo do Google Drive.' }, { status: 502 })
    }

    const contentType = (upstream.headers.get('content-type')?.split(';')[0] || '').toLowerCase()
    const extension = MIME_EXTENSIONS[contentType]
    if (!extension) {
      return NextResponse.json({ error: 'O Google Drive não retornou um formato de foto ou vídeo compatível.' }, { status: 502 })
    }

    const name = safeBaseName(searchParams.get('name'))
    const filename = `${name}.${extension}`
    const fallbackFilename = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')
    const encodedFilename = encodeURIComponent(filename).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `${searchParams.get('preview') === '1' ? 'inline' : 'attachment'}; filename="${fallbackFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': upstream.headers.get('accept-ranges') || 'bytes',
    })
    const contentLength = upstream.headers.get('content-length')
    const contentRange = upstream.headers.get('content-range')
    if (contentLength) headers.set('Content-Length', contentLength)
    if (contentRange) headers.set('Content-Range', contentRange)

    return new NextResponse(upstream.body, { status: upstream.status, headers })
  } catch {
    return NextResponse.json({ error: 'Falha ao obter o arquivo do Google Drive.' }, { status: 502 })
  }
}
