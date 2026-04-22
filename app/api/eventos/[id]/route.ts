import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { titulo, descricao, data, horario, categoriaId, destaque } = body

  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!horario?.trim()) return NextResponse.json({ error: 'Horário é obrigatório.' }, { status: 400 })

  const dataObj = new Date(data)
  if (!data || isNaN(dataObj.getTime())) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })

  const evento = await prisma.evento.update({
    where: { id },
    data: {
      titulo: titulo.trim().slice(0, 200),
      descricao: descricao?.trim().slice(0, 1000) || null,
      data: dataObj,
      horario: horario.trim().slice(0, 20),
      categoriaId: categoriaId || null,
      // destaque removido da UI
    },
    include: { categoria: true },
  })
  return NextResponse.json(evento)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.evento.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
