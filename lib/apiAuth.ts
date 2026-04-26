import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export type AuthResult =
  | { ok: true; userId: string; role: string; permissoes: Record<string, boolean> }
  | { ok: false; response: NextResponse }

const ROLE_LEVEL: Record<string, number> = { SUPERADMIN: 3, ADMIN: 2, EDITOR: 1 }

export function roleLevel(role: string): number {
  return ROLE_LEVEL[role] ?? 0
}

export function canManageRole(managerRole: string, targetRole: string): boolean {
  return roleLevel(managerRole) > roleLevel(targetRole)
}

export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return { ok: false, response: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }

  let permissoes: Record<string, boolean> = {}
  try { permissoes = (token.permissoes as any) || {} } catch {}

  return { ok: true, userId: (token.id as string) ?? '', role: (token.role as string) ?? 'EDITOR', permissoes }
}

export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth
  if (roleLevel(auth.role) < 2) return { ok: false, response: NextResponse.json({ error: 'Requer privilégios de administrador' }, { status: 403 }) }
  return auth
}

export async function requireSuperAdmin(req: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth
  if (auth.role !== 'SUPERADMIN') return { ok: false, response: NextResponse.json({ error: 'Requer Super Admin' }, { status: 403 }) }
  return auth
}

/** Verifica se o usuário tem uma permissão específica do perfil */
export async function requirePermissao(req: NextRequest, permissao: string): Promise<AuthResult> {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth
  // SUPERADMIN sempre tem tudo
  if (auth.role === 'SUPERADMIN') return auth
  if (!auth.permissoes[permissao]) return { ok: false, response: NextResponse.json({ error: `Sem permissão: ${permissao}` }, { status: 403 }) }
  return auth
}

export function getClientIP(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
