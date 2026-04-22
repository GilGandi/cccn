'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/admin/Modal'

type Palavra = { id: string; titulo: string; descricao: string; videoUrl: string; pregador: string; data: string; publicado: boolean }
const empty = { titulo: '', descricao: '', videoUrl: '', pregador: '', data: new Date().toISOString().slice(0, 10), publicado: true }
const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

export default function AdminPalavras() {
  const [items, setItems]   = useState<Palavra[]>([])
  const [modal, setModal]   = useState<'novo' | 'editar' | null>(null)
  const [form, setForm]     = useState<any>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = async () => {
    const r = await fetch('/api/palavras')
    setItems(await r.json())
  }
  useEffect(() => { load() }, [])

  const openNovo  = () => { setForm(empty); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (p: Palavra) => { setForm({ ...p, data: p.data.slice(0, 10) }); setEditId(p.id); setMsg(''); setModal('editar') }

  const save = async () => {
    if (!form.titulo.trim()) { setMsg('Título é obrigatório.'); return }
    setSaving(true); setMsg('')
    const url    = editId ? `/api/palavras/${editId}` : '/api/palavras'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Excluir esta palavra?')) return
    await fetch(`/api/palavras/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Palavras</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Gerencie mensagens e ensinamentos</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Nova palavra
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
            <p className="font-body text-[0.85rem] text-[#444]">Nenhuma palavra cadastrada.</p>
            <button onClick={openNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Cadastrar a primeira</button>
          </div>
        )}
        {items.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-body text-[0.9rem] text-[#f0ede8] truncate">{p.titulo}</span>
                {!p.publicado && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded bg-white/[0.06] text-[#555]">Rascunho</span>}
                {p.videoUrl && (
                  <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded bg-[#c8b99a]/10 text-[#c8b99a]">Vídeo</span>
                )}
              </div>
              <div className="font-body text-[0.75rem] text-[#555] mt-0.5">
                {p.pregador && `${p.pregador} · `}{new Date(p.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditar(p)}
                className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => del(p.id)}
                className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'novo' ? 'Nova palavra' : 'Editar palavra'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Título *</label>
              <input className={inp} placeholder="Título da mensagem" value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Pregador</label>
                <input className={inp} placeholder="Nome do pregador" value={form.pregador}
                  onChange={e => setForm({ ...form, pregador: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Data</label>
                <input type="date" className={inp} value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={lbl}>Link do vídeo (YouTube / Vimeo)</label>
              <input className={inp} placeholder="https://youtube.com/watch?v=..." value={form.videoUrl}
                onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Descrição</label>
              <textarea className={inp + ' resize-none'} rows={3} placeholder="Resumo ou tema da mensagem"
                value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className={`w-9 h-5 rounded-full transition-colors relative ${form.publicado ? 'bg-[#c8b99a]' : 'bg-white/10'}`}
                onClick={() => setForm({ ...form, publicado: !form.publicado })}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.publicado ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="font-body text-[0.78rem] text-[#888]">Publicar no site</span>
            </label>
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Cadastrar' : 'Salvar alterações'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
