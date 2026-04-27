import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// @ts-ignore
import webpush from 'web-push'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@cccn.com.br', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)
}

function calcularHoraEnvio(dataEvento: Date, horario: string): Date {
  const match = horario.match(/(\d{1,2})/)
  const horaEvento = match ? parseInt(match[1]) : 19
  const envio = new Date(dataEvento)
  if (horaEvento >= 18) {
    envio.setHours(12, 30, 0, 0)
  } else if (horaEvento >= 8) {
    envio.setHours(8, 0, 0, 0)
  } else {
    envio.setDate(envio.getDate() - 1)
    envio.setHours(20, 0, 0, 0)
  }
  return envio
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const agora = new Date()
  const em30min = new Date(agora.getTime() + 30 * 60 * 1000)
  const hoje = new Date(agora); hoje.setHours(0,0,0,0)
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 2)

  const [eventos, subscriptions] = await Promise.all([
    prisma.evento.findMany({ where: { data: { gte: hoje, lte: amanha } }, take: 50 }),
    prisma.pushSubscription.findMany(),
  ])

  if (subscriptions.length === 0) return NextResponse.json({ enviados: 0 })

  let enviados = 0
  const promises: Promise<any>[] = []

  for (const evento of eventos) {
    const horaEnvio = calcularHoraEnvio(evento.data, evento.horario)
    if (horaEnvio < agora || horaEnvio > em30min) continue

    const dataFormatada = evento.data.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })
    const payload = JSON.stringify({ titulo: evento.titulo, corpo: `Hoje, ${evento.horario} — ${dataFormatada}`, url: '/agenda' })

    for (const sub of subscriptions) {
      const p = webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload
      ).then(() => { enviados++ })
       .catch(async (err: any) => {
         if (err.statusCode === 410 || err.statusCode === 404) {
           await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
         }
       })
      promises.push(p)
    }
  }

  await Promise.allSettled(promises)
  return NextResponse.json({ enviados })
}
