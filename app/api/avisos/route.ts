export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const avisos = await prisma.aviso.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(avisos)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  if (!body.texto?.trim()) return NextResponse.json({ error: 'Texto é obrigatório.' }, { status: 400 })

  const aviso = await prisma.aviso.create({
    data: { texto: body.texto.trim().slice(0, 500), ativo: body.ativo ?? true }
  })
  return NextResponse.json(aviso)
}
