import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const avisos = await prisma.aviso.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(avisos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const aviso = await prisma.aviso.create({ data: body })
  return NextResponse.json(aviso)
}
