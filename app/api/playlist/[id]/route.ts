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
  if (typeof body.titulo === 'string') data.titulo = body.titulo.trim().slice(0, 200)
  if (typeof body.url   === 'string') data.url   = body.url.trim()
  if (typeof body.ativo === 'boolean') data.ativo = body.ativo
  const p = await prisma.playlist.update({ where: { id }, data })
  return NextResponse.json(p)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.playlist.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
