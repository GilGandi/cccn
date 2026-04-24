import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAdmin } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  // Ação em massa — apenas ADMIN
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { mesOrigem, anoOrigem, mesDestino, anoDestino } = body
  const vals = [mesOrigem, anoOrigem, mesDestino, anoDestino]
  if (vals.some(v => !Number.isInteger(Number(v)))) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  const mes  = Number(mesOrigem);  const ano  = Number(anoOrigem)
  const mesD = Number(mesDestino); const anoD = Number(anoDestino)

  if (mes < 1 || mes > 12 || mesD < 1 || mesD > 12) {
    return NextResponse.json({ error: 'Mês deve ser entre 1 e 12.' }, { status: 400 })
  }
  if (ano < 2000 || ano > 2100 || anoD < 2000 || anoD > 2100) {
    return NextResponse.json({ error: 'Ano fora do intervalo permitido.' }, { status: 400 })
  }

  const inicio = new Date(ano, mes - 1, 1)
  const fim    = new Date(ano, mes, 0, 23, 59, 59)

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: inicio, lte: fim } },
    take: 100,
  })

  if (eventos.length === 0) return NextResponse.json({ importados: 0 })

  const diffMeses = (anoD - ano) * 12 + (mesD - mes)

  const criados = await prisma.$transaction(
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
        },
      })
    })
  )

  return NextResponse.json({ importados: criados.length })
}
