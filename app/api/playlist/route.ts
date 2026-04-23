export const revalidate = 300

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const playlists = await prisma.playlist.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(playlists)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { titulo, url, tipo } = await req.json()
  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!url?.trim())    return NextResponse.json({ error: 'URL é obrigatória.' }, { status: 400 })

  // Detecta tipo automaticamente
  const tipoDetectado = url.includes('spotify') ? 'spotify' : url.includes('youtube') || url.includes('youtu.be') ? 'youtube' : tipo || 'outro'

  const playlist = await prisma.playlist.create({
    data: { titulo: titulo.trim().slice(0, 200), url: url.trim(), tipo: tipoDetectado, ativo: true }
  })
  return NextResponse.json(playlist)
}
