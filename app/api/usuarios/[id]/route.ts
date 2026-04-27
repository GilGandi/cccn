import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, canManageRole } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, username: true } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  // EDITOR só pode editar a si próprio
  if (auth.role === 'EDITOR' && id !== auth.userId)
    return NextResponse.json({ error: 'Editores só podem editar o próprio perfil.' }, { status: 403 })

  // ADMIN não pode editar SUPERADMIN nem outro ADMIN
  if (auth.role === 'ADMIN' && !canManageRole(auth.role, target.role) && id !== auth.userId)
    return NextResponse.json({ error: 'Sem permissão para editar este usuário.' }, { status: 403 })

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { name, username, password } = parsed.data

  if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (!username?.trim() || !/^[a-z0-9._-]{3,50}$/i.test(username))
    return NextResponse.json({ error: 'Username inválido.' }, { status: 400 })
  if (password && (typeof password !== 'string' || password.length < 8 || password.length > 200))
    return NextResponse.json({ error: 'Senha deve ter entre 8 e 200 caracteres.' }, { status: 400 })

  const usernameLower = username.toLowerCase().trim()

  // Verificar conflito de username
  const conflict = await prisma.user.findFirst({ where: { username: usernameLower, NOT: { id } } })
  if (conflict) return NextResponse.json({ error: 'Username já está em uso.' }, { status: 400 })

  // Role NUNCA é alterável por este endpoint
  const data: any = { name: name.trim().slice(0, 100), username: usernameLower }
  if (password?.trim()) data.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true, id: updated.id, name: updated.name, username: updated.username })
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  // EDITOR não pode deletar ninguém
  if (auth.role === 'EDITOR')
    return NextResponse.json({ error: 'Editores não podem excluir usuários.' }, { status: 403 })

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  // Ninguém pode deletar a si próprio
  if (id === auth.userId)
    return NextResponse.json({ error: 'Você não pode deletar sua própria conta.' }, { status: 403 })

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, username: true } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  // SUPERADMIN nunca pode ser excluído
  if (target.role === 'SUPERADMIN')
    return NextResponse.json({ error: 'O Super Admin não pode ser excluído.' }, { status: 403 })

  // ADMIN não pode deletar outro ADMIN
  if (auth.role === 'ADMIN' && target.role === 'ADMIN')
    return NextResponse.json({ error: 'Somente o Super Admin pode excluir administradores.' }, { status: 403 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
