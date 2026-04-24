import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  // Ação destrutiva em massa — apenas ADMIN
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const umMesAtras = new Date()
  umMesAtras.setMonth(umMesAtras.getMonth() - 1)
  umMesAtras.setHours(0, 0, 0, 0)

  const { count } = await prisma.evento.deleteMany({
    where: { data: { lt: umMesAtras } },
  })

  return NextResponse.json({ removidos: count })
}
