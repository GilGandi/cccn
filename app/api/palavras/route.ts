import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const palavras = await prisma.palavra.findMany({
    where: { publicado: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(palavras)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const palavra = await prisma.palavra.create({ data: body })
  return NextResponse.json(palavra)
}
