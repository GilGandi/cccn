import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

let client: S3Client | undefined

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getClient(): S3Client {
  if (client) return client

  const endpoint = new URL(requiredEnv('R2_ENDPOINT'))
  if (endpoint.protocol !== 'https:' || endpoint.pathname !== '/' || endpoint.search || endpoint.hash) {
    throw new Error('R2_ENDPOINT must be an HTTPS origin, for example https://<account-id>.r2.cloudflarestorage.com')
  }

  client = new S3Client({
    region: 'auto',
    endpoint: endpoint.origin,
    forcePathStyle: true,
    credentials: {
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  })
  return client
}

function getPublicUrl(key: string): string {
  const base = new URL(requiredEnv('NEXT_PUBLIC_R2_PUBLIC_URL'))
  if (base.protocol !== 'https:' || base.search || base.hash) {
    throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL must be an HTTPS URL without query or fragment')
  }

  const prefix = base.pathname.replace(/\/+$/, '')
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  return `${base.origin}${prefix}/${encodedKey}`
}

export async function uploadToR2(
  buffer: Buffer,
  contentType: string,
  prefix: 'cccn' | 'cccn/inscricoes',
): Promise<{ url: string; key: string }> {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
  }
  const extension = extensions[contentType]
  if (!extension) throw new Error('Unsupported content type')

  const key = `${prefix}/${randomUUID()}.${extension}`
  await getClient().send(new PutObjectCommand({
    Bucket: requiredEnv('R2_BUCKET_NAME'),
    Key: key,
    Body: buffer,
    ContentLength: buffer.length,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  return { key, url: getPublicUrl(key) }
}
