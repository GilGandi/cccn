import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rotas que exigem ADMIN ou SUPERADMIN (EDITOR não acessa)
const ADMIN_ONLY = ['/admin/usuarios', '/admin/configuracoes', '/admin/perfis']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/admin/login', req.url)
    if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
      loginUrl.searchParams.set('callbackUrl', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  const role = (token.role as string) || ''

  // Verificar acesso a rotas restritas
  if (ADMIN_ONLY.some(r => pathname === r || pathname.startsWith(r + '/')) && role === 'EDITOR') {
    return NextResponse.redirect(new URL('/admin/agenda', req.url))
  }

  // /admin/perfis: apenas SUPERADMIN
  if ((pathname === '/admin/perfis' || pathname.startsWith('/admin/perfis/')) && role !== 'SUPERADMIN') {
    return NextResponse.redirect(new URL('/admin/agenda', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
