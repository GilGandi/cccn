export const revalidate = 300

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidPlaylistUrl } from '@/lib/validators'

export async function GET() {
  const playlists = await prisma.playlist.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(playlists)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { titulo, url } = body
  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!url?.trim())    return NextResponse.json({ error: 'URL é obrigatória.' }, { status: 400 })
  if (!isValidPlaylistUrl(url))
    return NextResponse.json({ error: 'URL inválida. Use Spotify ou YouTube.' }, { status: 400 })

  const tipo = url.includes('spotify') ? 'spotify'
    : (url.includes('youtube') || url.includes('youtu.be')) ? 'youtube'
    : 'outro'

  const playlist = await prisma.playlist.create({
    data: {
      titulo: titulo.trim().slice(0, 200),
      url: url.trim().slice(0, 500),
      tipo,
      ativo: true,
    }
  })
  return NextResponse.json(playlist)
}
