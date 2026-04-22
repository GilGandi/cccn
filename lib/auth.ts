import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'

// Hash dummy — usado quando o usuário não existe para manter tempo de resposta constante
// e evitar timing attack (não revelar se email existe)
const DUMMY_HASH = '$2a$12$dummy.hash.to.prevent.timing.attacks.on.user.enumeration'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // sessão expira em 8 horas
  },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Senha',    type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit: máx 10 tentativas por IP a cada 15 minutos
        const ip = (req as any)?.headers?.['x-forwarded-for'] ?? 'unknown'
        const key = `login:${ip}`
        if (!rateLimit(key, 10, 15 * 60 * 1000)) {
          throw new Error('Muitas tentativas. Tente novamente em 15 minutos.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        // Sempre faz bcrypt compare — mesmo quando user não existe
        // Isso garante tempo de resposta constante e evita user enumeration
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
