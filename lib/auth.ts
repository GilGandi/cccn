import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'

// Hash dummy — tempo constante vs. user enumeration
const DUMMY_HASH = '$2a$12$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789.'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,       // 8 horas
    updateAge: 60 * 60,        // atualiza a sessão a cada 1h
  },
  pages: { signIn: '/admin/login' },
  // Cookies com flags seguras em produção
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Senha',    type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null
        if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') return null
        if (credentials.email.length > 254 || credentials.password.length > 200) return null

        // Rate limit por IP + por e-mail (bloqueia ataques distribuídos a uma conta)
        const xff = (req as any)?.headers?.['x-forwarded-for']
        const ip = Array.isArray(xff) ? xff[0] : typeof xff === 'string' ? xff.split(',')[0].trim() : 'unknown'
        const emailLower = credentials.email.toLowerCase().trim()

        if (!rateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000)) {
          throw new Error('Muitas tentativas. Tente novamente em 15 minutos.')
        }
        if (!rateLimit(`login:email:${emailLower}`, 5, 15 * 60 * 1000)) {
          throw new Error('Conta temporariamente bloqueada. Tente novamente em 15 minutos.')
        }

        const user = await prisma.user.findUnique({ where: { email: emailLower } })

        // Tempo constante vs. user enumeration
        const hash = user?.password ?? DUMMY_HASH
        const valid = await bcrypt.compare(credentials.password, hash)

        if (!user || !valid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = (user as any).id
        token.name = user.name
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name           = token.name as string
        session.user.email          = token.email as string
        ;(session.user as any).id   = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
}
