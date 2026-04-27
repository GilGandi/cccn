export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/apiError'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCloudinaryUrl } from '@/lib/validators'

const ALLOWED_GALERIAS = ['geral', 'cultos', 'jovens', 'homens', 'mulheres', 'familia', 'eventos']

export async function GET() {
  const fotos = await prisma.foto.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
  return NextResponse.json(fotos)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { url, legenda, galeria, categoriaId } = body
  if (!url || !isValidCloudinaryUrl(url))
    return NextResponse.json({ error: 'URL de imagem inválida. Use o upload interno.' }, { status: 400 })

  const galeriaValida = ALLOWED_GALERIAS.includes(galeria) ? galeria : 'geral'

  const foto = await prisma.foto.create({
    data: {
      url: url.slice(0, 500),
      legenda: legenda?.trim().slice(0, 200) || null,
      galeria: galeriaValida,
      categoriaId: categoriaId || null,
    }
  })
  return NextResponse.json(foto)
}
