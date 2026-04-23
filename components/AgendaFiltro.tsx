'use client'
import { useState } from 'react'

type Categoria = { id: string; nome: string; cor: string; fotoUrl: string | null }
type Evento = { id: string; titulo: string; descricao: string | null; data: string; horario: string; categoria: Categoria | null; destaque: boolean; recorrencia?: string }

export default function AgendaFiltro({ eventos, categorias }: { eventos: Evento[]; categorias: Categoria[] }) {
  const [filtro, setFiltro] = useState<string>('todos')

  const filtrados = filtro === 'todos' ? eventos : eventos.filter(ev => ev.categoria?.id === filtro)

  const gcalUrl = `https://calendar.google.com/calendar/r?cid=webcal://${typeof window !== 'undefined' ? window.location.host : ''}/api/agenda.ics`
  const icalUrl = '/api/agenda.ics'

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
      {/* Barra de filtros + botão calendário */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFiltro('todos')}
            className={`px-4 py-1.5 font-body text-[0.65rem] tracking-widest uppercase rounded transition-colors border ${filtro === 'todos' ? 'bg-[#f0ede8] text-[#0a0a0a] border-[#f0ede8]' : 'text-[#888480] border-[rgba(240,237,232,0.15)] hover:text-[#f0ede8]'}`}>
            Todos
          </button>
          {categorias.map(c => (
            <button key={c.id} onClick={() => setFiltro(c.id)}
              className="px-4 py-1.5 font-body text-[0.65rem] tracking-widest uppercase rounded transition-colors border"
              style={{ background: filtro === c.id ? c.cor : 'transparent', color: filtro === c.id ? '#0a0a0a' : c.cor, borderColor: c.cor + '55' }}>
              {c.nome}
            </button>
          ))}
        </div>

        {/* Botão Google Calendar */}
        <div className="flex items-center gap-2 shrink-0">
          <a href={gcalUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-1.5 font-body text-[0.65rem] tracking-widest uppercase rounded border border-[rgba(240,237,232,0.15)] text-[#888480] hover:text-[#f0ede8] hover:border-[rgba(240,237,232,0.3)] transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Google Calendar
          </a>
          <a href={icalUrl} download="agenda-cccn.ics"
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase rounded border border-[rgba(240,237,232,0.15)] text-[#888480] hover:text-[#f0ede8] hover:border-[rgba(240,237,232,0.3)] transition-colors"
            title="Baixar arquivo .ics (Apple Calendar, Outlook...)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            .ics
          </a>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="font-body text-[0.88rem] text-[#888480] py-16 text-center">Nenhum evento encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ border: '1px solid rgba(240,237,232,0.12)', gap: 1, background: 'rgba(240,237,232,0.12)' }}>
          {filtrados.map(ev => {
            const data = new Date(ev.data)
            const dia = data.getUTCDate().toString().padStart(2, '0')
            const cor = ev.categoria?.cor || '#c8b99a'
            const foto = ev.categoria?.fotoUrl

            return (
              <div key={ev.id} className="relative p-6 bg-[#0a0a0a] overflow-hidden">
                {foto && (
                  <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${foto})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }}/>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    {ev.categoria ? (
                      <span className="inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded"
                        style={{ background: cor + '22', color: cor, border: `1px solid ${cor}55` }}>
                        {ev.categoria.nome}
                      </span>
                    ) : <span />}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {ev.recorrencia && ev.recorrencia !== 'NENHUMA' && (
                        <span className="font-body text-[0.55rem] tracking-widest uppercase text-[#888480]" title="Evento recorrente">
                          ↻
                        </span>
                      )}
                      <span className="font-body text-[0.62rem] text-[#888480]">{ev.horario}</span>
                    </div>
                  </div>
                  <div className="font-display text-[2rem] text-[#c8b99a] leading-none mb-1">{dia}</div>
                  <div className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480] mb-3">
                    {data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', weekday: 'short', timeZone: 'UTC' })}
                  </div>
                  <div className="font-display text-[1.2rem] text-[#f0ede8] mb-1">{ev.titulo}</div>
                  {ev.descricao && <p className="font-body font-light text-[0.8rem] text-[#888480] leading-relaxed">{ev.descricao}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
