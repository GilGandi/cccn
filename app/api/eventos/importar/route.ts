import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { mesOrigem, anoOrigem, mesDestino, anoDestino } = await req.json()

  const inicio = new Date(anoOrigem, mesOrigem - 1, 1)
  const fim    = new Date(anoOrigem, mesOrigem, 0, 23, 59, 59)

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: inicio, lte: fim } },
  })

  const diffMeses = (anoDestino - anoOrigem) * 12 + (mesDestino - mesOrigem)

  const criados = await Promise.all(
    eventos.map(ev => {
      const novaData = new Date(ev.data)
      novaData.setMonth(novaData.getMonth() + diffMeses)
      return prisma.evento.create({
        data: {
          titulo:      ev.titulo,
          descricao:   ev.descricao,
          data:        novaData,
          horario:     ev.horario,
          categoriaId: ev.categoriaId,
          destaque:    ev.destaque,
        },
      })
    })
  )

  return NextResponse.json({ importados: criados.length })
}
