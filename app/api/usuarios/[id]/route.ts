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

  if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  if (password && password.length < 8)
    return NextResponse.json({ error: 'Senha deve ter no mínimo 8 caracteres.' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  // Verifica conflito de email (excluindo o próprio usuário)
  const conflict = await prisma.user.findFirst({ where: { email: email.toLowerCase(), NOT: { id } } })
  if (conflict) return NextResponse.json({ error: 'E-mail já está em uso.' }, { status: 400 })

  const data: any = { name: name.trim(), email: email.toLowerCase() }
  if (password?.trim()) data.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true, name: updated.name, email: updated.email })
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token.role as string) !== 'ADMIN')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  if (target.role === 'ADMIN')
    return NextResponse.json({ error: 'Não é possível deletar o administrador.' }, { status: 403 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
