import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  // Bloqueado em produção — use apenas localmente para setup inicial
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Não disponível em produção.' }, { status: 403 })
  }

  const existing = await prisma.user.findUnique({ where: { email: 'admin@cccn.com.br' } })
  if (existing) return NextResponse.json({ message: 'Admin já existe' })

  const hash = await bcrypt.hash('cccn@2024', 10)
  const user = await prisma.user.create({
    data: { name: 'Coordenador Geral', email: 'admin@cccn.com.br', password: hash, role: 'ADMIN' },
  })
  return NextResponse.json({ message: 'Admin criado!', email: user.email })
}
