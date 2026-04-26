// Upload público para anexos de inscrição em eventos
// Mais restrito que o upload admin — sem auth necessário mas com rate limit agressivo

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIP } from '@/lib/apiAuth'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import { isValidCuid } from '@/lib/validators'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED = ['image/jpeg','image/png','image/webp','application/pdf']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

function detectType(buf: Buffer): string | null {
  if (buf.length < 5) return null
  if (buf[0]===0xFF && buf[1]===0xD8 && buf[2]===0xFF) return 'image/jpeg'
  if (buf[0]===0x89 && buf[1]===0x50 && buf[2]===0x4E && buf[3]===0x47) return 'image/png'
  if (buf[0]===0x52 && buf[1]===0x49 && buf[2]===0x46 && buf[3]===0x46 &&
      buf[8]===0x57 && buf[9]===0x45 && buf[10]===0x42 && buf[11]===0x50) return 'image/webp'
  if (buf[0]===0x25 && buf[1]===0x50 && buf[2]===0x44 && buf[3]===0x46) return 'application/pdf'
  return null
}

export async function POST(req: NextRequest) {
  // Rate limit agressivo para upload público: 3 por IP a cada 10 minutos
  const ip = getClientIP(req)
  if (!rateLimit(`upload-inscricao:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }, { status: 429 })
  }

  const { searchParams } = req.nextUrl
  const eventoId = searchParams.get('eventoId')

  // Verificar se o evento existe, está ativo e tem campo de anexo configurado
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
    const isPdf = file.type === 'application/pdf'
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'cccn/inscricoes', resource_type: isPdf ? 'raw' : 'image' },
        (err, res) => err ? reject(err) : resolve(res)
      ).end(buffer)
    })
    return NextResponse.json({ url: result.secure_url, tipo: isPdf ? 'pdf' : 'imagem' })
  } catch {
    return NextResponse.json({ error: 'Falha no upload.' }, { status: 500 })
  }
}
