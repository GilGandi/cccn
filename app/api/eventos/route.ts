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

// Gera as datas de ocorrência de um evento recorrente
function gerarOcorrencias(dataInicio: Date, recorrencia: string, dataFim: Date | null): Date[] {
  if (recorrencia === 'NENHUMA') return [dataInicio]

  const fim = dataFim ?? (() => {
    const d = new Date(dataInicio)
    d.setMonth(d.getMonth() + 3) // padrão: 3 meses à frente
    return d
  })()

  const datas: Date[] = []
  const atual = new Date(dataInicio)

  while (atual <= fim) {
    datas.push(new Date(atual))
    if (recorrencia === 'SEMANAL')    atual.setDate(atual.getDate() + 7)
    if (recorrencia === 'QUINZENAL')  atual.setDate(atual.getDate() + 14)
    if (recorrencia === 'MENSAL')     atual.setMonth(atual.getMonth() + 1)
  }

  return datas.slice(0, 52) // limite de segurança: 52 ocorrências
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { titulo, descricao, data, horario, categoriaId, recorrencia, recorrenciaFim } = body

  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!horario?.trim()) return NextResponse.json({ error: 'Horário é obrigatório.' }, { status: 400 })

  const dataObj = new Date(data)
  if (!data || isNaN(dataObj.getTime())) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })

  const rec = recorrencia || 'NENHUMA'
  const recFim = recorrenciaFim ? new Date(recorrenciaFim) : null

  const datas = gerarOcorrencias(dataObj, rec, recFim)

  // Criar todas as ocorrências de uma vez
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

  return NextResponse.json({ criados: criados.length, evento: criados[0] })
}
