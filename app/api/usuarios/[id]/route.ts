import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAdmin } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isValidCuid, isValidEmail } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { name, email, password } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!email?.trim() || !isValidEmail(email))
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  if (password && (typeof password !== 'string' || password.length < 8 || password.length > 200))
    return NextResponse.json({ error: 'Senha deve ter entre 8 e 200 caracteres.' }, { status: 400 })

  const emailLower = email.toLowerCase().trim()

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  // Verifica conflito de email
  const conflict = await prisma.user.findFirst({ where: { email: emailLower, NOT: { id } } })
  if (conflict) return NextResponse.json({ error: 'E-mail já está em uso.' }, { status: 400 })

  // IMPORTANTE: role NUNCA é alterável por este endpoint
  const data: any = { name: name.trim().slice(0, 100), email: emailLower }
  if (password?.trim()) data.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true, id: updated.id, name: updated.name, email: updated.email })
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  // Admin NÃO pode deletar a si próprio (evita lockout)
  if (id === auth.userId)
    return NextResponse.json({ error: 'Você não pode deletar sua própria conta.' }, { status: 403 })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  if (target.role === 'ADMIN')
    return NextResponse.json({ error: 'Não é possível deletar um administrador.' }, { status: 403 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
