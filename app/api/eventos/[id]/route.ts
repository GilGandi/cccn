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

  const { titulo, descricao, data, horario, categoriaId } = body

  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!horario?.trim()) return NextResponse.json({ error: 'Horário é obrigatório.' }, { status: 400 })

  const dataObj = new Date(data)
  if (!data || isNaN(dataObj.getTime())) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })

  // Valida categoriaId se enviada
  if (categoriaId && !isValidCuid(categoriaId))
    return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 })

  try {
    const evento = await prisma.evento.update({
      where: { id },
      data: {
        titulo:      titulo.trim().slice(0, 200),
        descricao:   descricao?.trim().slice(0, 1000) || null,
        data:        dataObj,
        horario:     horario.trim().slice(0, 20),
        categoriaId: categoriaId || null,
      },
      include: { categoria: true },
    })
    return NextResponse.json(evento)
  } catch {
    return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await prisma.evento.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  }
}
