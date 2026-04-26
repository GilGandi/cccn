import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { userRepository } from '@/lib/repositories/userRepository'
import { criarUsuario } from '@/lib/use-cases/userUseCase'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response
  const users = await userRepository.findAll()
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response

  const { name, username, password, role, perfilId } = parsed.data
  const result = await criarUsuario({ name, username, password, role, perfilId, actorRole: auth.role })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.user)
}
