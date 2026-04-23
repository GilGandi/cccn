export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lideres = await prisma.lider.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
  })
  return NextResponse.json(lideres)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, cargo, bio, fotoUrl, ordem } = await req.json()
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!cargo?.trim()) return NextResponse.json({ error: 'Cargo é obrigatório.' }, { status: 400 })

  const lider = await prisma.lider.create({
    data: {
      nome:   nome.trim().slice(0, 100),
      cargo:  cargo.trim().slice(0, 100),
      bio:    bio?.trim().slice(0, 1000) || null,
      fotoUrl: fotoUrl || null,
      ordem:  Number(ordem) || 0,
    }
  })
  return NextResponse.json(lider)
}
