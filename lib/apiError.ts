import { NextResponse } from 'next/server'

/** Retorna um erro 500 com detalhes do Prisma/Node para facilitar debug */
export function apiError(e: any, context: string): NextResponse {
  const message = e?.message || 'Erro desconhecido'
  const code    = e?.code    || null
  const meta    = e?.meta    ? JSON.stringify(e.meta) : null

  // Log no servidor
  console.error(`[${context}]`, message, code, meta)

  // Detalhes na resposta — ajuda a diagnosticar sem precisar de console
  const detail = [
    message,
    code    ? `Código: ${code}` : null,
    meta    ? `Meta: ${meta}`   : null,
  ].filter(Boolean).join(' | ')

  return NextResponse.json(
    { error: 'Erro interno no servidor.', detail },
    { status: 500 }
  )
}
