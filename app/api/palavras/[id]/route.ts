import { isValidVideoUrl } from '@/lib/validators'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  if (!body.titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })

  // Whitelist explícita de campos — evita mass assignment
  const data: any = {
    titulo:    body.titulo.trim().slice(0, 200),
    descricao: body.descricao?.trim().slice(0, 2000) || null,
    pregador:  body.pregador?.trim().slice(0, 100) || null,
    publicado: typeof body.publicado === 'boolean' ? body.publicado : true,
  }
  if (body.videoUrl?.trim()) {
    if (!isValidVideoUrl(body.videoUrl)) return NextResponse.json({ error: 'URL de vídeo inválida. Use YouTube ou Vimeo.' }, { status: 400 })
    data.videoUrl = body.videoUrl.trim()
  }
  if (body.data) {
    const d = new Date(body.data)
    if (!isNaN(d.getTime())) data.data = d
  }

  const palavra = await prisma.palavra.update({ where: { id }, data })
  return NextResponse.json(palavra)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.palavra.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
