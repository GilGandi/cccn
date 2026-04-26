import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'

const DUMMY_HASH = '$2a$12$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789.'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60, updateAge: 60 * 60 },
  pages: { signIn: '/admin/login' },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha',   type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) return null
        if (typeof credentials.username !== 'string' || typeof credentials.password !== 'string') return null
        if (credentials.username.length > 100 || credentials.password.length > 200) return null

        const xff = (req as any)?.headers?.['x-forwarded-for']
        const ip = Array.isArray(xff) ? xff[0] : typeof xff === 'string' ? xff.split(',')[0].trim() : 'unknown'
        const usernameLower = credentials.username.toLowerCase().trim()

        if (!rateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000)) throw new Error('Muitas tentativas. Tente novamente em 15 minutos.')
        if (!rateLimit(`login:user:${usernameLower}`, 5, 15 * 60 * 1000)) throw new Error('Conta temporariamente bloqueada.')

        const user = await prisma.user.findUnique({
          where: { username: usernameLower },
          include: { perfil: { select: { id: true, nome: true, permissoes: true } } },
        })

        const hash = user?.password ?? DUMMY_HASH
        const valid = await bcrypt.compare(credentials.password, hash)
        if (!user || !valid) return null

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          perfilId: user.perfilId,
          perfilNome: user.perfil?.nome,
          permissoes: user.perfil?.permissoes ? JSON.parse(user.perfil.permissoes) : {},
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // No login inicial — preenche com dados do authorize
      if (user) {
        token.id         = (user as any).id
        token.username   = (user as any).username
        token.role       = (user as any).role
        token.perfilId   = (user as any).perfilId
        token.perfilNome = (user as any).perfilNome
        token.permissoes = (user as any).permissoes
      }

      // A cada refresh do token — busca role atualizado do banco
      // Isso garante que mudanças de role refletem sem precisar fazer novo login
      if (!user && token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, perfilId: true, perfil: { select: { nome: true, permissoes: true } } },
          })
          if (fresh) {
            token.role       = fresh.role
            token.perfilId   = fresh.perfilId
            token.perfilNome = fresh.perfil?.nome
            token.permissoes = fresh.perfil?.permissoes ? JSON.parse(fresh.perfil.permissoes) : {}
          }
        } catch {
          // Se o banco não estiver disponível, mantém o token existente
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id          = token.id
        session.user.name                 = token.name as string
        ;(session.user as any).username   = token.username
        ;(session.user as any).role       = token.role
        ;(session.user as any).perfilId   = token.perfilId
        ;(session.user as any).perfilNome = token.perfilNome
        ;(session.user as any).permissoes = token.permissoes
      }
      return session
    },
  },
}
