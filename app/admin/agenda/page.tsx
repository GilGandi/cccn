'use client'
import { useEffect, useState } from 'react'

const MINISTERIOS = ['GERAL','HOMENS','MULHERES','JOVENS','FAMILIA','CELULAS']
const LABELS: Record<string,string> = {
  GERAL:'Geral', HOMENS:'Homens', MULHERES:'Mulheres',
  JOVENS:'Jovens', FAMILIA:'Família', CELULAS:'Células'
}

type Evento = {
  id: string; titulo: string; descricao: string; data: string
  horario: string; ministerio: string; destaque: boolean
}

const empty = { titulo:'', descricao:'', data:'', horario:'', ministerio:'GERAL', destaque:false }

export default function AdminAgenda() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [form, setForm]       = useState<any>(empty)
  const [editing, setEditing] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const r = await fetch('/api/eventos')
    setEventos(await r.json())
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editing) {
      await fetch(`/api/eventos/${editing}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    } else {
      await fetch('/api/eventos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    }
    setForm(empty); setEditing(null); setShowForm(false); setLoading(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Deletar este evento?')) return
    await fetch(`/api/eventos/${id}`, { method:'DELETE' })
    load()
  }

  const edit = (ev: Evento) => {
    setForm({ ...ev, data: ev.data.slice(0,10) })
    setEditing(ev.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Agenda</h1>
          <p className="font-body text-[0.82rem] text-[#888480]">Gerencie cultos e eventos</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true) }}
          className="px-5 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-[0.15em] uppercase hover:bg-[#c8b99a] transition-colors">
          + Novo evento
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-8 p-6 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">{editing ? 'Editar evento' : 'Novo evento'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Título" required>
              <input required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className={input} placeholder="Nome do evento"/>
            </Field>
            <Field label="Ministério">
              <select value={form.ministerio} onChange={e => setForm({...form, ministerio: e.target.value})} className={input}>
                {MINISTERIOS.map(m => <option key={m} value={m}>{LABELS[m]}</option>)}
              </select>
            </Field>
            <Field label="Data" required>
              <input required type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className={input}/>
            </Field>
            <Field label="Horário" required>
              <input required value={form.horario} onChange={e => setForm({...form, horario: e.target.value})} className={input} placeholder="19h – 21h"/>
            </Field>
            <Field label="Descrição" className="sm:col-span-2">
              <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className={input + ' resize-none'} rows={2} placeholder="Descrição opcional"/>
            </Field>
          </div>
          <label className="flex items-center gap-2 font-body text-[0.8rem] text-[#888480] cursor-pointer">
            <input type="checkbox" checked={form.destaque} onChange={e => setForm({...form, destaque: e.target.checked})} className="accent-[#c8b99a]"/>
            Destacar na home
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(empty) }}
              className="px-6 py-2.5 font-body text-[0.7rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {eventos.length === 0 && (
          <p className="font-body text-[0.85rem] text-[#888480] py-10 text-center">Nenhum evento cadastrado ainda.</p>
        )}
        {eventos.map(ev => (
          <div key={ev.id} className="flex items-center justify-between p-4 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] hover:border-[rgba(240,237,232,0.16)] transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <span className="font-display text-[1rem] text-[#f0ede8]">{ev.titulo}</span>
                {ev.destaque && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 bg-[rgba(200,185,154,0.15)] text-[#c8b99a] rounded">Destaque</span>}
              </div>
              <div className="font-body text-[0.75rem] text-[#888480]">
                {new Date(ev.data).toLocaleDateString('pt-BR')} · {ev.horario} · {LABELS[ev.ministerio]}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => edit(ev)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Editar</button>
              <button onClick={() => del(ev.id)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors">Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const input = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"

function Field({ label, children, required, className }: any) {
  return (
    <div className={`flex flex-col gap-1.5 ${className||''}`}>
      <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">{label}{required && ' *'}</label>
      {children}
    </div>
  )
}
