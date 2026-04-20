import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fotos = await prisma.foto.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(fotos)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { url, legenda, galeria } = await req.json()
  const foto = await prisma.foto.create({ data: { url, legenda: legenda || null, galeria: galeria || 'geral' } })
  return NextResponse.json(foto)
}
