import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const target = await prisma.perfil.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, descricao, permissoes } = parsed.data
  const data: any = {}
  if (nome?.trim()) data.nome = nome.trim().slice(0, 100)
  if (typeof descricao === 'string') data.descricao = descricao.trim().slice(0, 500) || null
  if (permissoes && typeof permissoes === 'object') data.permissoes = JSON.stringify(permissoes)
  const perfil = await prisma.perfil.update({ where: { id }, data })
  return NextResponse.json(perfil)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const target = await prisma.perfil.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
  if (target.sistema) return NextResponse.json({ error: 'Perfis do sistema não podem ser excluídos.' }, { status: 403 })
  await prisma.perfil.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
