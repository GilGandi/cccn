import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token.role as string) !== 'ADMIN')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, email, password } = body

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target)
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const data: any = {}
  if (name)  data.name  = name
  if (email) data.email = email
  if (password && password.trim() !== '')
    data.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true, name: updated.name, email: updated.email })
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token.role as string) !== 'ADMIN')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target)
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  if (target.role === 'ADMIN')
    return NextResponse.json({ error: 'Não é possível deletar o administrador.' }, { status: 403 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
