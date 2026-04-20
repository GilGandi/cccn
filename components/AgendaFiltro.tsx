'use client'
import { useState } from 'react'

type Categoria = { id: string; nome: string; cor: string; fotoUrl: string | null }
type Evento = { id: string; titulo: string; descricao: string | null; data: string; horario: string; categoria: Categoria | null; destaque: boolean }

export default function AgendaFiltro({ eventos, categorias }: { eventos: Evento[]; categorias: Categoria[] }) {
  const [filtro, setFiltro] = useState<string>('todos')

  const filtrados = filtro === 'todos' ? eventos : eventos.filter(ev => ev.categoria?.id === filtro)

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
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
      )}

      {filtrados.length === 0 ? (
        <p className="font-body text-[0.88rem] text-[#888480] py-16 text-center">Nenhum evento encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ border: '1px solid rgba(240,237,232,0.12)', gap: 1, background: 'rgba(240,237,232,0.12)' }}>
          {filtrados.map(ev => {
            const data = new Date(ev.data)
            const dia = data.getDate().toString().padStart(2, '0')
            const cor = ev.categoria?.cor || '#c8b99a'
            const foto = ev.categoria?.fotoUrl

            return (
              <div key={ev.id} className="relative p-6 bg-[#0a0a0a] overflow-hidden">
                {/* Foto de fundo da categoria */}
                {foto && (
                  <div className="absolute inset-0 z-0" style={{
                    backgroundImage: `url(${foto})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.18,
                  }}/>
                )}
                <div className="relative z-10">
                  {ev.categoria && (
                    <span className="inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 mb-4 rounded"
                      style={{ background: cor + '22', color: cor, border: `1px solid ${cor}55` }}>
                      {ev.categoria.nome}
                    </span>
                  )}
                  <div className="absolute top-0 right-0 font-body text-[0.62rem] text-[#888480]">{ev.horario}</div>
                  <div className="font-display text-[2rem] text-[#c8b99a] leading-none mb-1">{dia}</div>
                  <div className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480] mb-3">
                    {data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', weekday: 'short' })}
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
