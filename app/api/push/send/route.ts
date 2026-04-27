import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
// @ts-ignore
import webpush from 'web-push'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@cccn.com.br', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }
  const { titulo, corpo, url } = body
  if (!titulo || !corpo) return NextResponse.json({ error: 'Título e corpo são obrigatórios.' }, { status: 400 })
  if (typeof titulo !== 'string' || typeof corpo !== 'string')
    return NextResponse.json({ error: 'Tipos inválidos.' }, { status: 400 })
  if (titulo.length > 100 || corpo.length > 500)
    return NextResponse.json({ error: 'Título ou corpo muito longo.' }, { status: 400 })
  if (url && (typeof url !== 'string' || !url.startsWith('/')))
    return NextResponse.json({ error: 'URL deve ser caminho relativo.' }, { status: 400 })

  const subscriptions = await prisma.pushSubscription.findMany()
  const payload = JSON.stringify({ titulo: titulo.slice(0, 100), corpo: corpo.slice(0, 500), url: url || '/agenda' })

  const resultados = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
        .catch(async (err: any) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
          }
          throw err
        })
    )
  )

  return NextResponse.json({
    enviados: resultados.filter(r => r.status === 'fulfilled').length,
    falhas:   resultados.filter(r => r.status === 'rejected').length,
    total:    subscriptions.length,
  })
}
