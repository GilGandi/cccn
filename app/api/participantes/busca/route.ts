import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIP } from '@/lib/apiAuth'
import { participanteRepository } from '@/lib/repositories/participanteRepository'

export async function GET(req: NextRequest) {
  const ip = getClientIP(req)
  if (!rateLimit(`autocomplete:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas buscas. Aguarde um momento.' }, { status: 429 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 3) return NextResponse.json([])

  // Sanitizar — apenas letras, espaços, acentos, apóstrofes e hífens
  if (!/^[\p{L}\s'\-]{3,100}$/u.test(q)) return NextResponse.json([])

  // Usa a versão pública do repository — retorna apenas id e nome
  const participantes = await participanteRepository.searchPublic(q)
  return NextResponse.json(participantes)
}
