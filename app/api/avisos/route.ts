export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const avisos = await prisma.aviso.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(avisos)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  if (!body.texto?.trim()) return NextResponse.json({ error: 'Texto é obrigatório.' }, { status: 400 })

  const aviso = await prisma.aviso.create({
    data: {
      texto: body.texto.trim().slice(0, 500),
      ativo: body.ativo ?? true,
    }
  })
  return NextResponse.json(aviso)
}
