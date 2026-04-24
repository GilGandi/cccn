import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toIcal(date: Date, horario: string): string {
  const [h, m] = horario.split(':').map(Number)
  const d = new Date(date)
  d.setUTCHours((h || 0) + 3, m || 0, 0, 0) // BRT → UTC
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcal(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET() {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const seisM = new Date(); seisM.setMonth(seisM.getMonth() + 6)

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: hoje, lte: seisM } },
    include: { categoria: { select: { nome: true } } },
    orderBy: { data: 'asc' },
    take: 500,
  })

  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CCCN//Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Agenda CCCN',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    ...eventos.map(ev => {
      const dtstart = toIcal(ev.data, ev.horario)
      const [h, m] = ev.horario.split(':').map(Number)
      const fim = new Date(ev.data)
      fim.setUTCHours((h || 0) + 3 + 2, m || 0, 0, 0)
      const dtend = fim.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      return [
        'BEGIN:VEVENT',
        `UID:${ev.id}@cccn`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeIcal(ev.titulo)}`,
        ev.descricao ? `DESCRIPTION:${escapeIcal(ev.descricao)}` : '',
        ev.categoria?.nome ? `CATEGORIES:${escapeIcal(ev.categoria.nome)}` : '',
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        'END:VEVENT',
      ].filter(Boolean).join('\r\n')
    }),
    'END:VCALENDAR',
  ]

  return new NextResponse(linhas.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="agenda-cccn.ics"',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
