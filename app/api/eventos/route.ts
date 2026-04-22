export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const todos = searchParams.get('todos') === 'true'

  const where = todos ? {} : (() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const seisM = new Date()
    seisM.setMonth(seisM.getMonth() + 6)
    return { data: { gte: hoje, lte: seisM } }
  })()

  const eventos = await prisma.evento.findMany({
    where,
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

  // Validação de campos obrigatórios
  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!horario?.trim()) return NextResponse.json({ error: 'Horário é obrigatório.' }, { status: 400 })

  const dataObj = new Date(data)
  if (!data || isNaN(dataObj.getTime())) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })

  const evento = await prisma.evento.create({
    data: {
      titulo: titulo.trim().slice(0, 200),
      descricao: descricao?.trim().slice(0, 1000) || null,
      data: dataObj,
      horario: horario.trim().slice(0, 20),
      categoriaId: categoriaId || null,
      // destaque removido da UI
    },
    include: { categoria: true },
  })
  return NextResponse.json(evento)
}
