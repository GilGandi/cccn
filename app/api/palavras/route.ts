export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidInstagramPostUrl, isValidVideoUrl } from '@/lib/validators'

export async function GET() {
  const palavras = await prisma.palavra.findMany({
    where: { publicado: true },
    orderBy: { data: 'desc' },
    take: 200,
  })
  return NextResponse.json(palavras)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  if (!body.titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  const mediaUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : ''
  if (mediaUrl && !isValidVideoUrl(mediaUrl) && !isValidInstagramPostUrl(mediaUrl))
    return NextResponse.json({ error: 'Link inválido. Use um vídeo do YouTube/Vimeo ou uma publicação/reel do Instagram.' }, { status: 400 })

  let dataObj: Date | undefined
  if (body.data) {
    dataObj = new Date(body.data)
    if (isNaN(dataObj.getTime()))
      return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })
  }

  const palavra = await prisma.palavra.create({
    data: {
      titulo:    body.titulo.trim().slice(0, 200),
      descricao: body.descricao?.trim().slice(0, 2000) || null,
      videoUrl:  mediaUrl.slice(0, 500) || null,
      pregador:  body.pregador?.trim().slice(0, 100) || null,
      data:      dataObj ?? new Date(),
      publicado: body.publicado ?? true,
    }
  })
  return NextResponse.json(palavra)
}
