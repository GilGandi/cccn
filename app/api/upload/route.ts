import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getClientIP } from '@/lib/apiAuth'
import { rateLimit } from '@/lib/rateLimit'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

// Magic bytes para validar o conteúdo real do arquivo, não só o MIME type
function detectImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png'
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'image/gif'
  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
      && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp'
  return null
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  // Rate limit: máx 30 uploads por usuário em 10 minutos
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

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Arquivo vazio.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10 MB.' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Validar magic bytes — impede bypass do MIME type fornecido pelo cliente
  const actualType = detectImageType(buffer)
  if (!actualType || !ALLOWED_TYPES.includes(actualType)) {
    return NextResponse.json({ error: 'Arquivo não é uma imagem válida.' }, { status: 400 })
  }

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'cccn',
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'webp', 'gif'],
          // remove metadados EXIF (que podem conter GPS)
          image_metadata: false,
          // limite extra de tamanho
          transformation: [
          { width: 2400, height: 2400, crop: 'limit' }, // previne decompression bomb
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
        },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(buffer)
    })
    return NextResponse.json({ url: result.secure_url })
  } catch (e) {
    return NextResponse.json({ error: 'Falha no upload.' }, { status: 500 })
  }
}
