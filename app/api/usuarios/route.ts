import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { userRepository } from '@/lib/repositories/userRepository'
import { criarUsuario } from '@/lib/use-cases/userUseCase'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response
  try {
    const users = await userRepository.findAll()
    return NextResponse.json(users)
  } catch (e: any) {
    console.error('[GET /api/usuarios]', e?.message)
    return NextResponse.json({ error: 'Erro ao buscar usuários.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response

  try {
    const { name, username, password, role, perfilId } = parsed.data
    const result = await criarUsuario({ name, username, password, role, perfilId, actorRole: auth.role })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json(result.user)
  } catch (e: any) {
    console.error('[POST /api/usuarios]', e?.message, e?.code)
    // Erros conhecidos do Prisma
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Username já está em uso.' }, { status: 400 })
    if (e?.message?.includes('invalid input value for enum')) {
      return NextResponse.json({ error: 'Role inválido. Refaça login e tente novamente.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno ao criar usuário.' }, { status: 500 })
  }
}
