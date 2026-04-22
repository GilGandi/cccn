export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const ALLOWED_GALERIAS = ['geral', 'cultos', 'jovens', 'homens', 'mulheres', 'familia', 'eventos']

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.hostname === 'res.cloudinary.com'
  } catch {
    return false
  }
}

export async function GET() {
  const fotos = await prisma.foto.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(fotos)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { url, legenda, galeria } = await req.json()

  if (!url || !isValidImageUrl(url))
    return NextResponse.json({ error: 'URL de imagem inválida. Use o upload interno.' }, { status: 400 })

  const galeriaValida = ALLOWED_GALERIAS.includes(galeria) ? galeria : 'geral'

  const foto = await prisma.foto.create({
    data: {
      url,
      legenda: legenda?.trim().slice(0, 200) || null,
      galeria: galeriaValida,
    }
  })
  return NextResponse.json(foto)
}
