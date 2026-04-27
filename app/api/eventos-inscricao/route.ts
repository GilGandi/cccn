export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/apiError'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import { isValidCloudinaryUrl } from '@/lib/validators'

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export async function GET() {
  const eventos = await prisma.eventoInscricao.findMany({
    orderBy: { dataEncerramento: 'asc' },
    include: { _count: { select: { inscricoes: true } } },
  })
  return NextResponse.json(eventos)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { titulo, descricao, fotoUrl, datas, dataEncerramento, telefoneObrig, sexoObrig, idadeObrig, vagas } = parsed.data

  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!dataEncerramento) return NextResponse.json({ error: 'Data de encerramento é obrigatória.' }, { status: 400 })
  if (fotoUrl && !isValidCloudinaryUrl(fotoUrl)) return NextResponse.json({ error: 'URL de foto inválida.' }, { status: 400 })

  const dataEnc = new Date(dataEncerramento)
  if (isNaN(dataEnc.getTime())) return NextResponse.json({ error: 'Data de encerramento inválida.' }, { status: 400 })

  // Gerar slug único
  let slug = slugify(titulo)
  const existing = await prisma.eventoInscricao.findFirst({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const evento = await prisma.eventoInscricao.create({
    data: {
      titulo: titulo.trim().slice(0, 200),
      descricao: descricao?.trim().slice(0, 2000) || null,
      fotoUrl: fotoUrl || null,
      slug,
      datas: JSON.stringify(Array.isArray(datas) ? datas.slice(0, 20) : []),
      dataEncerramento: dataEnc,
      telefoneObrig: Boolean(telefoneObrig),
      sexoObrig: Boolean(sexoObrig),
      idadeObrig: Boolean(idadeObrig),
      vagas: vagas ? Math.max(1, Math.min(99999, Number(vagas))) : null,
    }
  })
  return NextResponse.json(evento)
}
