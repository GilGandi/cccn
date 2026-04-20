import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categorias = await prisma.categoria.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(categorias)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, cor, fotoUrl } = await req.json()
  const cat = await prisma.categoria.create({ data: { nome, cor: cor || '#c8b99a', fotoUrl: fotoUrl || null } })
  return NextResponse.json(cat)
}
