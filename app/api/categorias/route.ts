export const revalidate = 60

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

  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (cor && !/^#[0-9A-Fa-f]{6}$/.test(cor))
    return NextResponse.json({ error: 'Cor inválida. Use formato hex (#RRGGBB).' }, { status: 400 })

  const cat = await prisma.categoria.create({
    data: {
      nome: nome.trim().slice(0, 100),
      cor: cor || '#c8b99a',
      fotoUrl: fotoUrl || null,
    }
  })
  return NextResponse.json(cat)
}
