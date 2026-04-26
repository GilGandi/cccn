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
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const p = await prisma.participante.findUnique({
    where: { id },
    include: { inscricoes: { include: { evento: { select: { titulo: true, slug: true, dataEncerramento: true } } } } }
  })
  if (!p) return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 })
  return NextResponse.json(p)
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, telefone, sexo, idade } = parsed.data
  const data: any = {}
  if (nome?.trim()) {
    if (nome.trim().split(' ').length < 2) return NextResponse.json({ error: 'Informe nome e sobrenome.' }, { status: 400 })
    data.nome = nome.trim().slice(0, 200)
  }
  if (typeof telefone === 'string') data.telefone = telefone.trim().replace(/\D/g, '').slice(0, 15) || null
  if (sexo !== undefined) {
    if (sexo && !['M','F'].includes(sexo)) return NextResponse.json({ error: 'Sexo inválido.' }, { status: 400 })
    data.sexo = sexo || null
  }
  if (idade !== undefined) data.idade = idade !== null ? Math.max(0, Math.min(150, Number(idade))) : null
  try {
    const p = await prisma.participante.update({ where: { id }, data })
    return NextResponse.json(p)
  } catch { return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    await prisma.participante.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 }) }
}
