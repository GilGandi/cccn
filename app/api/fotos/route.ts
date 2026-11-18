export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCloudinaryUrl, isValidCuid } from '@/lib/validators'

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

  const { url, legenda, categoriaId } = body
  if (!url || !isValidCloudinaryUrl(url))
    return NextResponse.json({ error: 'URL de imagem inválida. Use o upload interno.' }, { status: 400 })

  if (categoriaId && !isValidCuid(categoriaId))
    return NextResponse.json({ error: 'Álbum inválido.' }, { status: 400 })
  if (categoriaId) {
    const album = await prisma.galeriaCategoria.findUnique({ where: { id: categoriaId }, select: { id: true } })
    if (!album) return NextResponse.json({ error: 'Álbum não encontrado.' }, { status: 404 })
  }

  const foto = await prisma.foto.create({
    data: {
      url: url.slice(0, 500),
      legenda: legenda?.trim().slice(0, 200) || null,
      galeria: 'geral',
      categoriaId: categoriaId || null,
    }
  })
  return NextResponse.json(foto)
}
