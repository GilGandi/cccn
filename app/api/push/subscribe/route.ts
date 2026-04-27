import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIP } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  if (!rateLimit(`push:${ip}`, 5, 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
  }
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }
  const { endpoint, keys } = body
  if (!endpoint?.startsWith('https://') || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Subscription inválida.' }, { status: 400 })
  }
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }
  if (!body?.endpoint) return NextResponse.json({ error: 'Endpoint obrigatório.' }, { status: 400 })
  await prisma.pushSubscription.deleteMany({ where: { endpoint: body.endpoint } })
  return NextResponse.json({ ok: true })
}
