export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { isValidVideoUrl } from '@/lib/validators'

export async function GET() {
  const palavras = await prisma.palavra.findMany({
    where: { publicado: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(palavras)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  if (!body.titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (body.videoUrl && !isValidVideoUrl(body.videoUrl))
    return NextResponse.json({ error: 'URL de vídeo inválida. Use YouTube ou Vimeo.' }, { status: 400 })

  const palavra = await prisma.palavra.create({
    data: {
      titulo:    body.titulo.trim().slice(0, 200),
      descricao: body.descricao?.trim().slice(0, 2000) || null,
      videoUrl:  body.videoUrl?.trim() || null,
      pregador:  body.pregador?.trim().slice(0, 100) || null,
      data:      body.data ? new Date(body.data) : new Date(),
      publicado: body.publicado ?? true,
    }
  })
  return NextResponse.json(palavra)
}
