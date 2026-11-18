import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await prisma.foto.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Foto não encontrada.' }, { status: 404 })
  }
}
