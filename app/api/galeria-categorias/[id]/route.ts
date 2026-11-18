import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import { isValidCloudinaryUrl, isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, descricao, ordem, capaUrl } = parsed.data
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (capaUrl && !isValidCloudinaryUrl(capaUrl)) return NextResponse.json({ error: 'URL da capa inválida.' }, { status: 400 })
  try {
    const cat = await prisma.galeriaCategoria.update({
      where: { id },
      data: { nome: nome.trim().slice(0, 100), descricao: descricao?.trim().slice(0, 300) || null, capaUrl: capaUrl || null, ordem: Number(ordem) || 0 }
    })
    return NextResponse.json(cat)
  } catch { return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    // Desvincula fotos antes de deletar
    await prisma.foto.updateMany({ where: { categoriaId: id }, data: { categoriaId: null } })
    await prisma.galeriaCategoria.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 }) }
}
