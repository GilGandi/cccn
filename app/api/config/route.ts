export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getConfigs, setConfig } from '@/lib/config'

export async function GET() {
  const configs = await getConfigs()
  return NextResponse.json(configs)
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token.role as string) !== 'ADMIN')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  // body é um objeto { chave: valor, chave2: valor2 }
  await Promise.all(
    Object.entries(body).map(([id, valor]) =>
      setConfig(id, String(valor).slice(0, 2000))
    )
  )
  return NextResponse.json({ ok: true })
}
