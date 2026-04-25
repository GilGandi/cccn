'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/admin/Modal'

type Aviso = { id: string; texto: string; ativo: boolean; createdAt: string }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

export default function AdminAvisos() {
  const [items, setItems]   = useState<Aviso[]>([])
  const [modal, setModal]   = useState<'novo' | 'editar' | null>(null)
  const [texto, setTexto]   = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/avisos')
    setItems(await r.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo = () => { setTexto(''); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (a: Aviso) => { setTexto(a.texto); setEditId(a.id); setMsg(''); setModal('editar') }

  const save = async () => {
    if (!texto.trim()) { setMsg('Digite o texto do aviso.'); return }
    setSaving(true); setMsg('')
    if (editId) {
      await fetch(`/api/avisos/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto }) })
    } else {
      await fetch('/api/avisos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto, ativo: true }) })
    }
    setSaving(false); setModal(null); load()
  }

  const toggle = async (id: string, ativo: boolean) => {
    await fetch(`/api/avisos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !ativo }) })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Excluir este aviso?')) return
    await fetch(`/api/avisos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Avisos</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Avisos rápidos exibidos no site</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo aviso
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (
      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
            <p className="font-body text-[0.85rem] text-[#444]">Nenhum aviso cadastrado.</p>
            <button onClick={openNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Criar o primeiro aviso</button>
          </div>
        )}
        {items.map(a => (
          <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.ativo ? 'bg-green-400' : 'bg-[#444]'}`} />
            <p className="font-body text-[0.88rem] text-[#f0ede8] flex-1 leading-relaxed">{a.texto}</p>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => toggle(a.id, a.ativo)}
                className={`px-2.5 py-1.5 rounded-lg font-body text-[0.62rem] tracking-widest uppercase border transition-all
                  ${a.ativo ? 'text-green-400 border-green-400/20 hover:bg-green-400/[0.08]' : 'text-[#555] border-white/[0.08] hover:text-[#f0ede8]'}`}>
                {a.ativo ? 'Ativo' : 'Inativo'}
              </button>
              <button onClick={() => openEditar(a)}
                className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => del(a.id)}
                className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo aviso' : 'Editar aviso'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Texto do aviso *</label>
              <textarea className={inp + ' resize-none'} rows={4}
                placeholder="Ex: Culto especial neste domingo às 19h — todos são bem-vindos!"
                value={texto} onChange={e => setTexto(e.target.value)} autoFocus />
              <p className="font-body text-[0.6rem] text-[#555] mt-1">{texto.length}/500 caracteres</p>
            </div>
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Publicar aviso' : 'Salvar alterações'}
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
