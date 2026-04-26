import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import { isValidCuid, isValidCloudinaryUrl } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const evento = await prisma.eventoInscricao.findFirst({
    where: isValidCuid(id) ? { id } : { slug: id },
    include: { _count: { select: { inscricoes: true } } },
  })
  if (!evento) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  return NextResponse.json(evento)
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { titulo, descricao, fotoUrl, datas, dataEncerramento, telefoneObrig, sexoObrig, idadeObrig, vagas, ativo } = parsed.data

  const data: any = {}
  if (titulo?.trim()) data.titulo = titulo.trim().slice(0, 200)
  if (typeof descricao === 'string') data.descricao = descricao.trim().slice(0, 2000) || null
  if (fotoUrl !== undefined) {
    if (fotoUrl && !isValidCloudinaryUrl(fotoUrl)) return NextResponse.json({ error: 'URL de foto inválida.' }, { status: 400 })
    data.fotoUrl = fotoUrl || null
  }
  if (Array.isArray(datas)) data.datas = JSON.stringify(datas.slice(0, 20))
  if (dataEncerramento) {
    const d = new Date(dataEncerramento)
    if (isNaN(d.getTime())) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })
    data.dataEncerramento = d
  }
  if (typeof telefoneObrig === 'boolean') data.telefoneObrig = telefoneObrig
  if (typeof sexoObrig === 'boolean') data.sexoObrig = sexoObrig
  if (typeof idadeObrig === 'boolean') data.idadeObrig = idadeObrig
  if (typeof ativo === 'boolean') data.ativo = ativo
  if (vagas !== undefined) data.vagas = vagas ? Math.max(1, Math.min(99999, Number(vagas))) : null

  try {
    const evento = await prisma.eventoInscricao.update({ where: { id }, data })
    return NextResponse.json(evento)
  } catch { return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    await prisma.eventoInscricao.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 }) }
}
