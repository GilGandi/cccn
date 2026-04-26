import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, perfilId: true, perfil: { select: { nome: true } }, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { name, username, password, role, perfilId } = parsed.data

  if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!username?.trim() || !/^[a-z0-9._-]{3,50}$/i.test(username))
    return NextResponse.json({ error: 'Username inválido. Use apenas letras, números, ponto, hífen ou underscore (3-50 chars).' }, { status: 400 })
  if (!password || password.length < 8 || password.length > 200)
    return NextResponse.json({ error: 'Senha deve ter entre 8 e 200 caracteres.' }, { status: 400 })

  const allowedRoles = ['EDITOR', ...(auth.role === 'SUPERADMIN' ? ['ADMIN'] : [])]
  const newRole = allowedRoles.includes(role) ? role : 'EDITOR'

  const usernameLower = username.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { username: usernameLower } })
  if (existing) return NextResponse.json({ error: 'Username já está em uso.' }, { status: 400 })

  // Validar perfilId se enviado
  let validPerfilId: string | null = null
  if (perfilId) {
    const perfil = await prisma.perfil.findUnique({ where: { id: perfilId } })
    if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 400 })
    validPerfilId = perfilId
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name: name.trim().slice(0, 100), username: usernameLower, password: hash, role: newRole as any, perfilId: validPerfilId },
    select: { id: true, name: true, username: true, role: true, perfilId: true, createdAt: true },
  })
  return NextResponse.json(user)
}
