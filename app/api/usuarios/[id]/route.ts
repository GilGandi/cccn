import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token.role as string) !== 'ADMIN')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  // Protege o admin - não pode deletar a si mesmo nem outro ADMIN
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  if (target.role === 'ADMIN') return NextResponse.json({ error: 'Não é possível deletar o administrador.' }, { status: 403 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
