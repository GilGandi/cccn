// Helpers de autorização para rotas de API

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export type AuthResult =
  | { ok: true; userId: string; role: string }
  | { ok: false; response: NextResponse }

/** Exige qualquer usuário autenticado */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }
  }
  return { ok: true, userId: (token.id as string) ?? '', role: (token.role as string) ?? '' }
}

/** Exige role ADMIN */
export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth
  if (auth.role !== 'ADMIN') {
    return { ok: false, response: NextResponse.json({ error: 'Requer privilégios de administrador' }, { status: 403 }) }
  }
  return auth
}

/** Extrai o IP cliente respeitando cabeçalhos de proxy do Railway */
export function getClientIP(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}
