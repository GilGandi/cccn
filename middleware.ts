import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_ONLY = ['/admin/usuarios', '/admin/configuracoes']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Login e APIs passam direto
  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/admin/login', req.url)
    // Só inclui callbackUrl se for path relativo e não for o root admin
    if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
      loginUrl.searchParams.set('callbackUrl', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Verificação de role para rotas restritas
  if (ADMIN_ONLY.some(r => pathname === r || pathname.startsWith(r + '/')) && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/agenda', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
