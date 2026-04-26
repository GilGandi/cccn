export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim()

  const participantes = await prisma.participante.findMany({
    where: q ? { nome: { contains: q, mode: 'insensitive' } } : undefined,
    orderBy: { nome: 'asc' },
    take: 50,
    include: { _count: { select: { inscricoes: true } } },
  })
  return NextResponse.json(participantes)
}

export async function POST(req: NextRequest) {
  // Público — qualquer um pode criar participante (inscrição pública)
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, telefone, sexo, idade } = parsed.data

  if (!nome?.trim() || nome.trim().split(' ').length < 2)
    return NextResponse.json({ error: 'Informe nome e sobrenome.' }, { status: 400 })
  if (sexo && !['M','F'].includes(sexo))
    return NextResponse.json({ error: 'Sexo inválido.' }, { status: 400 })
  if (idade !== undefined && idade !== null) {
    const n = Number(idade)
    if (!Number.isInteger(n) || n < 0 || n > 150)
      return NextResponse.json({ error: 'Idade inválida.' }, { status: 400 })
  }

  const participante = await prisma.participante.create({
    data: {
      nome: nome.trim().slice(0, 200),
      telefone: telefone?.trim().replace(/\D/g, '').slice(0, 15) || null,
      sexo: sexo || null,
      idade: idade !== undefined && idade !== null ? Number(idade) : null,
    }
  })
  return NextResponse.json(participante)
}
