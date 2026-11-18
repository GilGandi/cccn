import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { prisma } from '@/lib/prisma'
import { isValidCloudinaryUrl } from '@/lib/validators'

export async function GET() {
  try {
    const cats = await prisma.galeriaCategoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { fotos: true } } },
    })
    return NextResponse.json(cats)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const { nome, descricao, ordem, capaUrl } = parsed.data
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  if (capaUrl && !isValidCloudinaryUrl(capaUrl)) return NextResponse.json({ error: 'URL da capa inválida.' }, { status: 400 })
  const cat = await prisma.galeriaCategoria.create({
    data: { nome: nome.trim().slice(0, 100), descricao: descricao?.trim().slice(0, 300) || null, capaUrl: capaUrl || null, ordem: Number(ordem) || 0 }
  })
  return NextResponse.json(cat)
}
