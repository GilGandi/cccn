'use client'
import { useEffect, useState } from 'react'

type Palavra = {
  id: string; titulo: string; descricao: string
  videoUrl: string; pregador: string; data: string; publicado: boolean
}

const empty = { titulo:'', descricao:'', videoUrl:'', pregador:'', data: new Date().toISOString().slice(0,10), publicado: true }
const input = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"

export default function AdminPalavras() {
  const [items, setItems]     = useState<Palavra[]>([])
  const [form, setForm]       = useState<any>(empty)
  const [editing, setEditing] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const r = await fetch('/api/palavras')
    setItems(await r.json())
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    if (editing) {
      await fetch(`/api/palavras/${editing}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    } else {
      await fetch('/api/palavras', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    }
    setForm(empty); setEditing(null); setShowForm(false); setLoading(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Deletar esta palavra?')) return
    await fetch(`/api/palavras/${id}`, { method:'DELETE' })
    load()
  }

  const edit = (p: Palavra) => {
    setForm({ ...p, data: p.data.slice(0,10) })
    setEditing(p.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Palavras</h1>
          <p className="font-body text-[0.82rem] text-[#888480]">Gerencie mensagens e ensinamentos</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true) }}
          className="px-5 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-[0.15em] uppercase hover:bg-[#c8b99a] transition-colors">
          + Nova palavra
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-8 p-6 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">{editing ? 'Editar' : 'Nova palavra'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Título *</label>
              <input required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className={input} placeholder="Título da mensagem"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Pregador</label>
              <input value={form.pregador} onChange={e => setForm({...form, pregador: e.target.value})} className={input} placeholder="Nome do pregador"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Data</label>
              <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className={input}/>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Link do vídeo (YouTube)</label>
              <input value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} className={input} placeholder="https://youtube.com/watch?v=..."/>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className={input + ' resize-none'} rows={2} placeholder="Resumo ou tema da mensagem"/>
            </div>
          </div>
          <label className="flex items-center gap-2 font-body text-[0.8rem] text-[#888480] cursor-pointer">
            <input type="checkbox" checked={form.publicado} onChange={e => setForm({...form, publicado: e.target.checked})} className="accent-[#c8b99a]"/>
            Publicar no site
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
        {items.length === 0 && (
          <p className="font-body text-[0.85rem] text-[#888480] py-10 text-center">Nenhuma palavra cadastrada ainda.</p>
        )}
        {items.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] hover:border-[rgba(240,237,232,0.16)] transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <span className="font-display text-[1rem] text-[#f0ede8]">{p.titulo}</span>
                {!p.publicado && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 bg-[rgba(136,132,128,0.15)] text-[#888480] rounded">Rascunho</span>}
              </div>
              <div className="font-body text-[0.75rem] text-[#888480]">
                {p.pregador && `${p.pregador} · `}{new Date(p.data).toLocaleDateString('pt-BR')}
                {p.videoUrl && ' · 🎥 Vídeo'}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => edit(p)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Editar</button>
              <button onClick={() => del(p.id)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors">Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
