import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIP } from '@/lib/apiAuth'
import { rateLimit } from '@/lib/rateLimit'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_PDF_TYPES   = ['application/pdf']
const ALL_ALLOWED         = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES]
const MAX_SIZE_BYTES      = 10 * 1024 * 1024 // 10 MB
const MAX_PDF_BYTES       = 5 * 1024 * 1024  // 5 MB para PDF

function detectFileType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png'
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif'
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp'
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return 'application/pdf'
  return null
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const ip = getClientIP(req)
  if (!rateLimit(`upload:${auth.userId || ip}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitos uploads. Aguarde alguns minutos.' }, { status: 429 })
  }

  let formData: FormData
  try { formData = await req.formData() } catch {
    return NextResponse.json({ error: 'Form data inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }
  if (!ALL_ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo não permitido. Use JPEG, PNG, WebP, GIF ou PDF.' }, { status: 400 })
  }
  if (file.size === 0) return NextResponse.json({ error: 'Arquivo vazio.' }, { status: 400 })

  const isPdf = file.type === 'application/pdf'
  const maxSize = isPdf ? MAX_PDF_BYTES : MAX_SIZE_BYTES
  if (file.size > maxSize) {
    return NextResponse.json({ error: `Arquivo muito grande. Máximo ${isPdf ? '5' : '10'} MB.` }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const actualType = detectFileType(buffer)
  if (!actualType || !ALL_ALLOWED.includes(actualType)) {
    return NextResponse.json({ error: 'Conteúdo do arquivo não é uma imagem ou PDF válido.' }, { status: 400 })
  }
  if (actualType !== file.type && !(actualType === 'image/jpeg' && file.type === 'image/jpg')) {
    return NextResponse.json({ error: 'Tipo declarado não corresponde ao conteúdo real.' }, { status: 400 })
  }

  try {
    const result = await uploadToR2(buffer, actualType, 'cccn')
    return NextResponse.json({
      url: result.url,
      tipo: isPdf ? 'pdf' : 'imagem',
      nome: file.name.slice(0, 200),
    })
  } catch {
    return NextResponse.json({ error: 'Falha no upload para o armazenamento.' }, { status: 500 })
  }
}
