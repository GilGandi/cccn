export const revalidate = 60

import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/apiError'
import { parseJson } from '@/lib/parseJson'
import { requireAdmin } from '@/lib/apiAuth'
import { getConfigs, setConfig } from '@/lib/config'
import { isValidSocialUrl, isValidMapsUrl, isValidHandle } from '@/lib/validators'

export async function GET() {
  const configs = await getConfigs()
  return NextResponse.json(configs)
}

// Whitelist explícita de chaves aceitáveis — impede criação de chaves arbitrárias
const ALLOWED_KEYS = new Set([
  'nome_igreja', 'nome_curto', 'subtitulo', 'cidade', 'endereco', 'bairro',
  'cidade_estado', 'cep', 'cnpj',
  'pix_chave', 'pix_tipo',
  'culto_dia', 'culto_dia_exibicao', 'culto_horario',
  'instagram', 'instagram_handle', 'facebook', 'facebook_handle', 'tiktok', 'tiktok_handle',
  'ano_fundacao', 'historia_titulo', 'historia_p1', 'historia_p2', 'historia_p3',
  'doacoes_texto', 'maps_link', 'hero_subtitulo', 'home_historia',
  'home_card1_titulo', 'home_card1_desc',
  'home_card2_titulo', 'home_card2_desc',
  'home_card3_titulo', 'home_card3_desc',
])

// Limites por tipo de campo (caracteres)
const LIMITS: Record<string, number> = {
  historia_p1: 2000, historia_p2: 2000, historia_p3: 2000,
  home_historia: 2000, doacoes_texto: 2000,
  nome_igreja: 200, subtitulo: 200,
  default: 500,
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const parsed = await parseJson(req)
  if (!parsed.ok) return parsed.response
  const body = parsed.data

  // Processar apenas chaves permitidas, com validação específica por tipo
  const updates: Array<[string, string]> = []
  for (const [id, rawValor] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(id)) continue // ignora chaves desconhecidas silenciosamente
    if (typeof rawValor !== 'string') continue

    const limit = LIMITS[id] ?? LIMITS.default
    const valor = rawValor.slice(0, limit)

    // Sanitização específica para campos de texto
    let valorFinal = valor
    if (id === 'cep') {
      valorFinal = valor.replace(/[^\d-]/g, '').slice(0, 10)
    }

    // Validações específicas
    if (id === 'instagram' && valor && !isValidSocialUrl(valor, 'instagram'))
      return NextResponse.json({ error: 'URL do Instagram inválida.' }, { status: 400 })
    if (id === 'facebook' && valor && !isValidSocialUrl(valor, 'facebook'))
      return NextResponse.json({ error: 'URL do Facebook inválida.' }, { status: 400 })
    if (id === 'maps_link' && valor && !isValidMapsUrl(valor))
      return NextResponse.json({ error: 'URL do Google Maps inválida.' }, { status: 400 })
    if (id === 'tiktok' && valor && !isValidSocialUrl(valor, 'tiktok'))
      return NextResponse.json({ error: 'URL do TikTok inválida.' }, { status: 400 })
    if ((id === 'instagram_handle' || id === 'facebook_handle' || id === 'tiktok_handle') && valor && !isValidHandle(valor))
      return NextResponse.json({ error: 'Nome de usuário inválido.' }, { status: 400 })

    updates.push([id, valorFinal])
  }

  await Promise.all(updates.map(([id, valor]) => setConfig(id, valor)))
  return NextResponse.json({ ok: true, updated: updates.length })
}
