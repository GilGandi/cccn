import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rotas que exigem role ADMIN
const ADMIN_ONLY = ['/admin/usuarios']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Login e APIs passam livremente pelo middleware
  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Sem token — redireciona para login
  if (!token) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verifica role para rotas restritas
  if (ADMIN_ONLY.some(r => pathname.startsWith(r)) && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/agenda', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
