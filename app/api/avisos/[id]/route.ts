import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Aceitar APENAS os campos permitidos — evita mass assignment
  const data: any = {}
  if (typeof body.texto === 'string') data.texto = body.texto.trim().slice(0, 500)
  if (typeof body.ativo === 'boolean') data.ativo = body.ativo

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'Nenhum campo válido enviado.' }, { status: 400 })

  const aviso = await prisma.aviso.update({ where: { id }, data })
  return NextResponse.json(aviso)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.aviso.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
