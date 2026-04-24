import { NextRequest, NextResponse } from 'next/server'
import { parseJson } from '@/lib/parseJson'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid, isValidHexColor, isValidCloudinaryUrl } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  const { nome, cor, fotoUrl } = body
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (cor && !isValidHexColor(cor))
    return NextResponse.json({ error: 'Cor inválida. Use formato hex (#RRGGBB).' }, { status: 400 })
  if (fotoUrl && !isValidCloudinaryUrl(fotoUrl))
    return NextResponse.json({ error: 'URL de foto inválida.' }, { status: 400 })

  try {
    const cat = await prisma.categoria.update({
      where: { id },
      data: {
        nome: nome.trim().slice(0, 100),
        cor: cor || '#c8b99a',
        fotoUrl: fotoUrl || null,
      },
    })
    return NextResponse.json(cat)
  } catch {
    return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await prisma.categoria.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 })
  }
}
