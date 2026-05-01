import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const cookies = req.cookies.getAll()

  return NextResponse.json({
    token: token ? { id: (token as any).id, role: (token as any).role, username: (token as any).username } : null,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    cookieNames: cookies.map(c => c.name),
    nextauthUrl: process.env.NEXTAUTH_URL,
  })
}
