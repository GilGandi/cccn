'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/admin/Modal'

type Playlist = { id: string; titulo: string; url: string; tipo: string; ativo: boolean }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const empty = { titulo: '', url: '' }

function TipoIcon({ tipo }: { tipo: string }) {
  if (tipo === 'spotify') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
  if (tipo === 'youtube') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
  return <span className="font-body text-[0.6rem] text-[#555]">🎵</span>
}

export default function AdminLouvor() {
  const [items, setItems]   = useState<Playlist[]>([])
  const [modal, setModal]   = useState<'novo' | 'editar' | null>(null)
  const [form, setForm]     = useState<any>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = async () => {
    const r = await fetch('/api/playlist')
    setItems(await r.json())
  }
  useEffect(() => { load() }, [])

  const openNovo   = () => { setForm(empty); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (p: Playlist) => { setForm({ titulo: p.titulo, url: p.url }); setEditId(p.id); setMsg(''); setModal('editar') }

  const save = async () => {
    if (!form.titulo.trim() || !form.url.trim()) { setMsg('Título e URL são obrigatórios.'); return }
    setSaving(true); setMsg('')
    const url    = editId ? `/api/playlist/${editId}` : '/api/playlist'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const toggle = async (id: string, ativo: boolean) => {
    await fetch(`/api/playlist/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !ativo }) })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Excluir esta playlist?')) return
    await fetch(`/api/playlist/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Louvor</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Playlists exibidas no site</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Nova playlist
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        {items.length === 0 && (
          <div className="col-span-2 text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
            <p className="font-body text-[0.85rem] text-[#444]">Nenhuma playlist cadastrada.</p>
            <button onClick={openNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Adicionar a primeira</button>
          </div>
        )}
        {items.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
              <TipoIcon tipo={p.tipo} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body text-[0.88rem] text-[#f0ede8] truncate">{p.titulo}</span>
                {!p.ativo && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded bg-white/[0.04] text-[#555]">Inativo</span>}
              </div>
              <a href={p.url} target="_blank" rel="noopener noreferrer"
                className="font-body text-[0.72rem] text-[#555] hover:text-[#c8b99a] transition-colors truncate block mt-0.5">
                {p.url}
              </a>
            </div>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => toggle(p.id, p.ativo)}
                className={`p-2 rounded-lg transition-all ${p.ativo ? 'text-green-400 hover:bg-green-400/[0.08]' : 'text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06]'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
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
        <Modal title={modal === 'novo' ? 'Nova playlist' : 'Editar playlist'} onClose={() => setModal(null)} size="sm">
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Título *</label>
              <input className={inp} placeholder="Ex: Louvor de Domingo" value={form.titulo} autoFocus
                onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>URL do Spotify ou YouTube *</label>
              <input className={inp} placeholder="https://open.spotify.com/playlist/..." value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })} />
              <p className="font-body text-[0.6rem] text-[#555] mt-1">Cole o link da playlist — o tipo é detectado automaticamente.</p>
            </div>
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Adicionar' : 'Salvar alterações'}
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
