import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0) // início do dia atual
  const seisM = new Date()
  seisM.setMonth(seisM.getMonth() + 6)

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: hoje, lte: seisM } },
    include: { categoria: true },
    orderBy: { data: 'asc' },
  })
  return NextResponse.json(eventos)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { titulo, descricao, data, horario, categoriaId, destaque } = body

  const evento = await prisma.evento.create({
    data: {
      titulo,
      descricao: descricao || null,
      data: new Date(data),
      horario,
      categoriaId: categoriaId || null,
      destaque: destaque || false,
    },
    include: { categoria: true },
  })
  return NextResponse.json(evento)
}
