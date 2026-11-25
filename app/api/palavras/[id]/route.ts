import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid, isValidInstagramPostUrl, isValidVideoUrl } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  if (!body.titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })

  const data: any = {
    titulo:    body.titulo.trim().slice(0, 200),
    descricao: body.descricao?.trim().slice(0, 2000) || null,
    pregador:  body.pregador?.trim().slice(0, 100) || null,
    publicado: typeof body.publicado === 'boolean' ? body.publicado : true,
    videoUrl:  null,
  }
  const mediaUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : ''
  if (mediaUrl) {
    if (!isValidVideoUrl(mediaUrl) && !isValidInstagramPostUrl(mediaUrl))
      return NextResponse.json({ error: 'Link inválido. Use um vídeo do YouTube/Vimeo ou uma publicação/reel do Instagram.' }, { status: 400 })
    data.videoUrl = mediaUrl.slice(0, 500)
  }
  if (body.data) {
    const d = new Date(body.data)
    if (!isNaN(d.getTime())) data.data = d
  }

  try {
    const palavra = await prisma.palavra.update({ where: { id }, data })
    return NextResponse.json(palavra)
  } catch {
    return NextResponse.json({ error: 'Palavra não encontrada.' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await prisma.palavra.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Palavra não encontrada.' }, { status: 404 })
  }
}
