import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const eventos = await prisma.evento.findMany({
    orderBy: { data: 'asc' },
  })
  return NextResponse.json(eventos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const evento = await prisma.evento.create({ data: body })
  return NextResponse.json(evento)
}
