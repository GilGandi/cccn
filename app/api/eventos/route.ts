export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'
import { gerarOcorrencias } from '@/lib/domain/rules'

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
    take: 500,
  })
  return NextResponse.json(eventos)
}

// gerarOcorrencias moved to lib/domain/rules

const RECORRENCIAS = ['NENHUMA','SEMANAL','QUINZENAL','MENSAL']

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { titulo, descricao, data, horario, categoriaId, recorrencia, recorrenciaFim } = body

  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!horario?.trim()) return NextResponse.json({ error: 'Horário é obrigatório.' }, { status: 400 })

  const dataObj = new Date(data)
  if (!data || isNaN(dataObj.getTime())) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })

  // Validar categoria se enviada
  if (categoriaId && !isValidCuid(categoriaId))
    return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 })

  // Validar recorrência
  const rec = recorrencia && RECORRENCIAS.includes(recorrencia) ? recorrencia : 'NENHUMA'
  const recFim = recorrenciaFim ? new Date(recorrenciaFim) : null
  if (recFim && isNaN(recFim.getTime()))
    return NextResponse.json({ error: 'Data de fim da recorrência inválida.' }, { status: 400 })

  const datas = gerarOcorrencias(dataObj, rec, recFim)

  const criados = await prisma.$transaction(
    datas.map(d => prisma.evento.create({
      data: {
        titulo:         titulo.trim().slice(0, 200),
        descricao:      descricao?.trim().slice(0, 1000) || null,
        data:           d,
        horario:        horario.trim().slice(0, 20),
        categoriaId:    categoriaId || null,
        recorrencia:    rec as any,
        recorrenciaFim: recFim,
      },
    }))
  )

  return NextResponse.json({ criados: criados.length })
}
