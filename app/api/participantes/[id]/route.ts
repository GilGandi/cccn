import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { participanteRepository } from '@/lib/repositories/participanteRepository'
import { isValidCuid } from '@/lib/validators'
import { apiError } from '@/lib/apiError'

type Params = Promise<{ id: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    const p = await participanteRepository.findById(id)
    if (!p) return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 })
    return NextResponse.json(p)
  } catch (e) { return apiError(e, 'GET /api/participantes/[id]') }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response

  const { nome, telefone, sexo, idade, logradouro, numero, bairro, cidade, estado } = parsed.data
  const data: any = {}

  if (nome?.trim()) {
    if (nome.trim().split(/\s+/).length < 2)
      return NextResponse.json({ error: 'Informe nome e sobrenome.' }, { status: 400 })
    data.nome = nome.trim().slice(0, 200)
  }
  if (typeof telefone === 'string') {
    if (!telefone.trim()) return NextResponse.json({ error: 'Telefone é obrigatório.' }, { status: 400 })
    data.telefone = telefone.trim().slice(0, 20)
  }
  if (sexo !== undefined) {
    if (sexo && !['M','F'].includes(sexo)) return NextResponse.json({ error: 'Sexo inválido.' }, { status: 400 })
    data.sexo = sexo || null
  }
  if (idade !== undefined) data.idade = idade !== null ? Math.max(0, Math.min(150, Number(idade))) : null
  if (logradouro !== undefined) data.logradouro = logradouro?.trim().slice(0, 200) || null
  if (numero !== undefined)     data.numero     = numero?.trim().slice(0, 20) || null
  if (bairro !== undefined)     data.bairro     = bairro?.trim().slice(0, 100) || null
  if (cidade !== undefined)     data.cidade     = cidade?.trim().slice(0, 100) || null
  if (estado !== undefined)     data.estado     = estado?.trim().slice(0, 50) || null

  try {
    const p = await participanteRepository.update(id, data)
    return NextResponse.json(p)
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 })
    return apiError(e, 'PUT /api/participantes/[id]')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!isValidCuid(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    await participanteRepository.delete(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Participante não encontrado.' }, { status: 404 })
    return apiError(e, 'DELETE /api/participantes/[id]')
  }
}
