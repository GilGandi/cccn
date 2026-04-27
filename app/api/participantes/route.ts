export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { participanteRepository } from '@/lib/repositories/participanteRepository'
import { apiError } from '@/lib/apiError'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  try {
    const participantes = await participanteRepository.search(q)
    return NextResponse.json(participantes)
  } catch (e) { return apiError(e, 'GET /api/participantes') }
}

export async function POST(req: NextRequest) {
  // Cadastro pelo admin (não pelo formulário público)
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response

  const { nome, telefone, sexo, idade, logradouro, numero, bairro, cidade, estado } = parsed.data

  if (!nome?.trim() || nome.trim().split(/\s+/).length < 2)
    return NextResponse.json({ error: 'Informe nome e sobrenome.' }, { status: 400 })
  if (!telefone?.trim())
    return NextResponse.json({ error: 'Telefone é obrigatório.' }, { status: 400 })
  if (sexo && !['M','F'].includes(sexo))
    return NextResponse.json({ error: 'Sexo inválido.' }, { status: 400 })
  if (idade !== undefined && idade !== null) {
    const n = Number(idade)
    if (!Number.isInteger(n) || n < 0 || n > 150)
      return NextResponse.json({ error: 'Idade inválida.' }, { status: 400 })
  }

  try {
    const participante = await participanteRepository.create({
      nome:       nome.trim().slice(0, 200),
      telefone:   telefone.trim().slice(0, 20),
      sexo:       sexo || null,
      idade:      idade !== undefined && idade !== null ? Number(idade) : null,
      logradouro: logradouro?.trim().slice(0, 200) || null,
      numero:     numero?.trim().slice(0, 20) || null,
      bairro:     bairro?.trim().slice(0, 100) || null,
      cidade:     cidade?.trim().slice(0, 100) || null,
      estado:     estado?.trim().slice(0, 50) || null,
    })
    return NextResponse.json(participante)
  } catch (e) { return apiError(e, 'POST /api/participantes') }
}
