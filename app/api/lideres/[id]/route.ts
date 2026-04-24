import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid, isValidCloudinaryUrl } from '@/lib/validators'

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
  if (typeof body.nome    === 'string') data.nome    = body.nome.trim().slice(0, 100)
  if (typeof body.cargo   === 'string') data.cargo   = body.cargo.trim().slice(0, 100)
  if (typeof body.bio     === 'string') data.bio     = body.bio.trim().slice(0, 1000) || null
  if (typeof body.fotoUrl === 'string') {
    if (body.fotoUrl && !isValidCloudinaryUrl(body.fotoUrl))
      return NextResponse.json({ error: 'URL de foto inválida.' }, { status: 400 })
    data.fotoUrl = body.fotoUrl || null
  }
  if (typeof body.ordem === 'number' && Number.isFinite(body.ordem)) {
    data.ordem = Math.max(0, Math.min(9999, Math.floor(body.ordem)))
  }
  if (typeof body.ativo === 'boolean') data.ativo = body.ativo

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'Nenhum campo válido.' }, { status: 400 })

  try {
    const lider = await prisma.lider.update({ where: { id }, data })
    return NextResponse.json(lider)
  } catch {
    return NextResponse.json({ error: 'Líder não encontrado.' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await prisma.lider.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Líder não encontrado.' }, { status: 404 })
  }
}
