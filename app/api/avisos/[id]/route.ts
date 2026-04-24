import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const data: any = {}
  if (typeof body.texto === 'string') data.texto = body.texto.trim().slice(0, 500)
  if (typeof body.ativo === 'boolean') data.ativo = body.ativo

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'Nenhum campo válido.' }, { status: 400 })

  try {
    const aviso = await prisma.aviso.update({ where: { id }, data })
    return NextResponse.json(aviso)
  } catch {
    return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await prisma.aviso.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 })
  }
}
