import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { titulo, descricao, data, horario, categoriaId, destaque } = body
  const evento = await prisma.evento.update({
    where: { id },
    data: { titulo, descricao: descricao || null, data: new Date(data), horario, categoriaId: categoriaId || null, destaque: destaque || false },
    include: { categoria: true },
  })
  return NextResponse.json(evento)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.evento.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
