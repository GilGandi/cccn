import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  const inscricoes = await prisma.inscricao.findMany({
    where: { eventoId: id },
    include: { participante: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(inscricoes)
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Público — inscrição pública no evento
  const { id: eventoId } = await params

  const evento = await prisma.eventoInscricao.findUnique({ where: { id: eventoId } })
  if (!evento) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  if (!evento.ativo) return NextResponse.json({ error: 'Evento encerrado.' }, { status: 400 })
  if (new Date() > new Date(evento.dataEncerramento)) return NextResponse.json({ error: 'Período de inscrição encerrado.' }, { status: 400 })

  // Verificar vagas
  if (evento.vagas) {
    const count = await prisma.inscricao.count({ where: { eventoId } })
    if (count >= evento.vagas) return NextResponse.json({ error: 'Vagas esgotadas.' }, { status: 400 })
  }

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, telefone, sexo, idade, participanteId } = parsed.data

  let partId: string

  if (participanteId && isValidCuid(participanteId)) {
    // Participante já existe
    const p = await prisma.participante.findUnique({ where: { id: participanteId } })
    if (!p) return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 })
    partId = p.id
  } else {
    // Validar campos obrigatórios do evento
    if (!nome?.trim() || nome.trim().split(' ').length < 2)
      return NextResponse.json({ error: 'Informe nome e sobrenome.' }, { status: 400 })
    if (evento.telefoneObrig && !telefone?.trim())
      return NextResponse.json({ error: 'Telefone é obrigatório para este evento.' }, { status: 400 })
    if (evento.sexoObrig && !sexo)
      return NextResponse.json({ error: 'Sexo é obrigatório para este evento.' }, { status: 400 })
    if (evento.idadeObrig && (idade === undefined || idade === null))
      return NextResponse.json({ error: 'Idade é obrigatória para este evento.' }, { status: 400 })
    if (sexo && !['M','F'].includes(sexo))
      return NextResponse.json({ error: 'Sexo inválido.' }, { status: 400 })

    const novo = await prisma.participante.create({
      data: {
        nome: nome.trim().slice(0, 200),
        telefone: telefone?.trim().replace(/\D/g, '').slice(0, 15) || null,
        sexo: sexo || null,
        idade: idade !== undefined && idade !== null ? Math.max(0, Math.min(150, Number(idade))) : null,
      }
    })
    partId = novo.id
  }

  // Verificar duplicidade
  const dup = await prisma.inscricao.findUnique({ where: { participanteId_eventoId: { participanteId: partId, eventoId } } })
  if (dup) return NextResponse.json({ error: 'Já inscrito neste evento.', inscricaoId: dup.id }, { status: 400 })

  const inscricao = await prisma.inscricao.create({
    data: { participanteId: partId, eventoId },
    include: { participante: true },
  })
  return NextResponse.json(inscricao)
}
