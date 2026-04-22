import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Remove eventos com mais de 1 mês de passado
  const umMesAtras = new Date()
  umMesAtras.setMonth(umMesAtras.getMonth() - 1)
  umMesAtras.setHours(0, 0, 0, 0)

  const { count } = await prisma.evento.deleteMany({
    where: { data: { lt: umMesAtras } },
  })

  return NextResponse.json({ removidos: count })
}
