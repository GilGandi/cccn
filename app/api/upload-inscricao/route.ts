// Upload público de anexos em inscrições — protegido por validação de evento e rate limit.

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIP } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

function detectType(buf: Buffer): string | null {
  if (buf.length < 5) return null
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'application/pdf'
  return null
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  if (!rateLimit(`upload-inscricao:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }, { status: 429 })
  }

  const eventoId = req.nextUrl.searchParams.get('eventoId')
  if (!eventoId || !isValidCuid(eventoId)) {
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 })
  }

  const evento = await prisma.eventoInscricao.findUnique({
    where: { id: eventoId },
    select: { ativo: true, campoAnexoLabel: true, dataEncerramento: true },
  })
  if (!evento?.ativo || new Date() > new Date(evento.dataEncerramento)) {
    return NextResponse.json({ error: 'Evento não disponível.' }, { status: 400 })
  }
  if (!evento.campoAnexoLabel) {
    return NextResponse.json({ error: 'Este evento não aceita anexos.' }, { status: 400 })
  }

  let formData: FormData
  try { formData = await req.formData() } catch {
    return NextResponse.json({ error: 'Form data inválido.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) return NextResponse.json({ error: 'Nenhum arquivo.' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Tipo não permitido. Use JPEG, PNG, WebP ou PDF.' }, { status: 400 })
  if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: 'Tamanho inválido. Máximo 5MB.' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const actualType = detectType(buffer)
  if (!actualType || actualType !== file.type) {
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  }

  try {
    const isPdf = actualType === 'application/pdf'
    const result = await uploadToR2(buffer, actualType, 'cccn/inscricoes')
    return NextResponse.json({ url: result.url, tipo: isPdf ? 'pdf' : 'imagem' })
  } catch {
    return NextResponse.json({ error: 'Falha no upload para o armazenamento.' }, { status: 500 })
  }
}
