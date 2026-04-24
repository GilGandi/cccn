import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAdmin } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isValidEmail } from '@/lib/validators'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { name, email, password } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!email?.trim() || !isValidEmail(email))
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 200)
    return NextResponse.json({ error: 'Senha deve ter entre 8 e 200 caracteres.' }, { status: 400 })

  const emailLower = email.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { email: emailLower } })
  if (existing) return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 })

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name: name.trim().slice(0, 100),
      email: emailLower,
      password: hash,
      role: 'COLABORADOR', // role sempre forçada para COLABORADOR via este endpoint
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json(user)
}
