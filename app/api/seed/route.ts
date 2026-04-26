import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  // Bloqueado em produção — use apenas localmente para setup inicial
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Não disponível em produção.' }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (existing) return NextResponse.json({ message: 'Admin já existe' })

  const hash = await bcrypt.hash('cccn@2024', 12)
  const user = await prisma.user.create({
    data: { name: 'Coordenador Geral', username: 'admin', password: hash, role: 'SUPERADMIN', perfilId: 'perfil_superadmin' },
  })
  return NextResponse.json({ message: 'Admin criado!', username: user.username })
}
