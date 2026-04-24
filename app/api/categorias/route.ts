export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidHexColor, isValidCloudinaryUrl } from '@/lib/validators'

export async function GET() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    take: 200,
  })
  return NextResponse.json(categorias)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { nome, cor, fotoUrl } = body
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (cor && !isValidHexColor(cor))
    return NextResponse.json({ error: 'Cor inválida. Use formato hex (#RRGGBB).' }, { status: 400 })
  if (fotoUrl && !isValidCloudinaryUrl(fotoUrl))
    return NextResponse.json({ error: 'URL de foto inválida.' }, { status: 400 })

  const cat = await prisma.categoria.create({
    data: {
      nome: nome.trim().slice(0, 100),
      cor: cor || '#c8b99a',
      fotoUrl: fotoUrl || null,
    }
  })
  return NextResponse.json(cat)
}
