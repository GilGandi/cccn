import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Formata data para iCal: YYYYMMDDTHHMMSS
function toIcal(date: Date, horario: string): string {
  const [h, m] = horario.split(':').map(Number)
  const d = new Date(date)
  d.setUTCHours(h + 3, m, 0, 0) // converte BRT → UTC (UTC-3)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcal(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const seisM = new Date()
  seisM.setMonth(seisM.getMonth() + 6)

  const eventos = await prisma.evento.findMany({
    where: { data: { gte: hoje, lte: seisM } },
    include: { categoria: { select: { nome: true } } },
    orderBy: { data: 'asc' },
  })

  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CCCN//Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Agenda CCCN',
    'X-WR-CALDESC:Cultos e eventos da Comunidade Cristã de Campos Novos',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    ...eventos.map(ev => {
      const dtstart = toIcal(ev.data, ev.horario)
      // Assume duração de 2h
      const [h, m] = ev.horario.split(':').map(Number)
      const fim = new Date(ev.data)
      fim.setUTCHours(h + 3 + 2, m, 0, 0)
      const dtend = fim.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      const uid = `${ev.id}@cccn`
      const summary = escapeIcal(ev.titulo)
      const desc = ev.descricao ? escapeIcal(ev.descricao) : ''
      const cat = ev.categoria?.nome ? escapeIcal(ev.categoria.nome) : ''

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${summary}`,
        desc ? `DESCRIPTION:${desc}` : '',
        cat ? `CATEGORIES:${cat}` : '',
        'LOCATION:Rua João Gonçalves de Araújo\\, 829 - Bairro Aparecida\\, Campos Novos - SC',
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
    },
  })
}
