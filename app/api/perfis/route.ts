import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/apiError'
import { requireSuperAdmin } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response
  try {
    const perfis = await prisma.perfil.findMany({ orderBy: { nome: 'asc' }, include: { _count: { select: { users: true } } } })
    return NextResponse.json(perfis)
  } catch (e: any) {
    console.error('[GET /api/perfis]', e?.message)
    return NextResponse.json([], { status: 200 }) // retorna vazio em vez de 500
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, descricao, permissoes } = parsed.data
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  const perfil = await prisma.perfil.create({
    data: { nome: nome.trim().slice(0, 100), descricao: descricao?.trim().slice(0, 500) || null, permissoes: JSON.stringify(permissoes || {}) }
  })
  return NextResponse.json(perfil)
}
