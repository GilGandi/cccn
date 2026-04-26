import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIP } from '@/lib/apiAuth'
import { parseJson } from '@/lib/parseJson'
import { inscricaoRepository } from '@/lib/repositories/inscricaoRepository'
import { executarInscricao } from '@/lib/use-cases/inscricaoUseCase'
import { isValidCuid } from '@/lib/validators'

type Params = Promise<{ id: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  const inscricoes = await inscricaoRepository.findByEvento(id)
  return NextResponse.json(inscricoes)
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Rate limit: máx 5 inscrições por IP a cada 10 minutos
  const ip = getClientIP(req)
  if (!rateLimit(`inscricao:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }, { status: 429 })
  }

  const { id: eventoId } = await params
  if (!isValidCuid(eventoId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response

  const result = await executarInscricao(eventoId, parsed.data)
  if (!result.ok) return NextResponse.json({ error: result.error, ...(result.inscricaoId ? { inscricaoId: result.inscricaoId } : {}) }, { status: result.status })

  return NextResponse.json(result.inscricao)
}
