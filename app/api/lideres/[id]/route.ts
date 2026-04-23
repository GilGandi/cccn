import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const data: any = {}
  if (typeof body.nome    === 'string') data.nome    = body.nome.trim().slice(0, 100)
  if (typeof body.cargo   === 'string') data.cargo   = body.cargo.trim().slice(0, 100)
  if (typeof body.bio     === 'string') data.bio     = body.bio.trim().slice(0, 1000) || null
  if (typeof body.fotoUrl === 'string') data.fotoUrl = body.fotoUrl || null
  if (typeof body.ordem   === 'number') data.ordem   = body.ordem
  if (typeof body.ativo   === 'boolean') data.ativo  = body.ativo
  const lider = await prisma.lider.update({ where: { id }, data })
  return NextResponse.json(lider)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.lider.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
