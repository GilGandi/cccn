'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'
import { safeImageSrc } from '@/lib/safeUrl'

type Lider = { id: string; nome: string; cargo: string; bio: string | null; fotoUrl: string | null; ordem: number; ativo: boolean }
const empty = { nome: '', cargo: '', bio: '', fotoUrl: '', ordem: 0 }
const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

export default function AdminLideres() {
  const [items, setItems]   = useState<Lider[]>([])
  const [modal, setModal]   = useState<'novo' | 'editar' | null>(null)
  const [form, setForm]     = useState<any>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/lideres')
    setItems(await r.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo   = () => { setForm(empty); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (l: Lider) => {
    setForm({ nome: l.nome, cargo: l.cargo, bio: l.bio || '', fotoUrl: l.fotoUrl || '', ordem: l.ordem })
    setEditId(l.id); setMsg(''); setModal('editar')
  }

  const save = async () => {
    if (!form.nome.trim()) { setMsg('Nome é obrigatório.'); return }
    if (!form.cargo.trim()) { setMsg('Cargo é obrigatório.'); return }
    setSaving(true); setMsg('')
    const url    = editId ? `/api/lideres/${editId}` : '/api/lideres'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Excluir este líder?')) return
    await fetch(`/api/lideres/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Liderança</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Pastores e líderes da comunidade</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo líder
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.length === 0 && (
          <div className="col-span-3 text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
            <p className="font-body text-[0.85rem] text-[#444]">Nenhum líder cadastrado.</p>
            <button onClick={openNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Adicionar o primeiro</button>
          </div>
        )}
        {items.map(l => (
          <div key={l.id} className="group bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all">
            {/* Foto */}
            <div className="relative h-48 bg-[#0a0a0a]">
              {safeImageSrc(l.fotoUrl) ? (
                <Image src={safeImageSrc(l.fotoUrl)!} alt={l.nome} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[2rem]">
                    {l.nome.charAt(0)}
                  </div>
                </div>
              )}
              {/* Ações hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openEditar(l)}
                  className="p-2.5 rounded-lg bg-white/10 text-[#f0ede8] hover:bg-white/20 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => del(l.id)}
                  className="p-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="p-4">
              <div className="font-display text-[1rem] text-[#f0ede8]">{l.nome}</div>
              <div className="font-body text-[0.7rem] tracking-widest uppercase text-[#c8b99a] mt-0.5">{l.cargo}</div>
              {l.bio && <p className="font-body text-[0.8rem] text-[#555] mt-2 leading-relaxed line-clamp-2">{l.bio}</p>}
            </div>
          </div>
        ))}
      </div>
      )}

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo líder' : 'Editar líder'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <ImageUpload value={form.fotoUrl} onChange={v => setForm({ ...form, fotoUrl: v })} label="Foto" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Nome *</label>
                <input className={inp} placeholder="Nome completo" value={form.nome} autoFocus
                  onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Cargo *</label>
                <input className={inp} placeholder="Ex: Pastor, Apóstolo..." value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={lbl}>Biografia</label>
              <textarea className={inp + ' resize-none'} rows={4} placeholder="Texto sobre o líder..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Ordem de exibição</label>
              <input type="number" className={inp} min={0} value={form.ordem}
                onChange={e => setForm({ ...form, ordem: Number(e.target.value) })} />
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
