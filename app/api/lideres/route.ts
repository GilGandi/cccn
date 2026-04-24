export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCloudinaryUrl } from '@/lib/validators'

export async function GET() {
  const lideres = await prisma.lider.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
    take: 100,
  })
  return NextResponse.json(lideres)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { nome, cargo, bio, fotoUrl, ordem } = body
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!cargo?.trim()) return NextResponse.json({ error: 'Cargo é obrigatório.' }, { status: 400 })
  if (fotoUrl && !isValidCloudinaryUrl(fotoUrl))
    return NextResponse.json({ error: 'URL de foto inválida.' }, { status: 400 })

  let ordemNum = 0
  if (ordem !== undefined && ordem !== null) {
    const n = Number(ordem)
    if (!Number.isFinite(n)) return NextResponse.json({ error: 'Ordem inválida.' }, { status: 400 })
    ordemNum = Math.max(0, Math.min(9999, Math.floor(n)))
  }

  const lider = await prisma.lider.create({
    data: {
      nome:   nome.trim().slice(0, 100),
      cargo:  cargo.trim().slice(0, 100),
      bio:    bio?.trim().slice(0, 1000) || null,
      fotoUrl: fotoUrl || null,
      ordem:  ordemNum,
    }
  })
  return NextResponse.json(lider)
}
