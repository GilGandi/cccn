'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'
import { safeImageSrc } from '@/lib/safeUrl'

type Foto = { id: string; url: string; legenda: string | null; galeria: string; ordem: number; createdAt: string }
const GALERIAS = ['geral', 'cultos', 'jovens', 'homens', 'mulheres', 'familia', 'eventos']
const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

export default function AdminGaleria() {
  const [fotos, setFotos]     = useState<Foto[]>([])
  const [filtro, setFiltro]   = useState('geral')
  const [modal, setModal]     = useState(false)
  const [url, setUrl]         = useState('')
  const [legenda, setLegenda] = useState('')
  const [galeria, setGaleria] = useState('geral')
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/fotos')
    const d = await r.json()
    setFotos(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openModal = () => { setUrl(''); setLegenda(''); setGaleria(filtro); setMsg(''); setModal(true) }

  const save = async () => {
    if (!url) { setMsg('Envie uma foto primeiro.'); return }
    setSaving(true); setMsg('')
    const r = await fetch('/api/fotos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, legenda: legenda || null, galeria }),
    })
    if (r.ok) { setModal(false); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Excluir esta foto?')) return
    await fetch(`/api/fotos/${id}`, { method: 'DELETE' })
    load()
  }

  const filtradas = fotos.filter(f => f.galeria === filtro)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Galeria</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Gerencie as fotos da comunidade</p>
        </div>
        <button onClick={openModal}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Adicionar foto
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (<>
      {/* Filtro galerias */}
      <div className="flex flex-wrap gap-1.5 mb-6 bg-[#111] border border-white/[0.06] rounded-lg p-1.5">
        {GALERIAS.map(g => (
          <button key={g} onClick={() => setFiltro(g)}
            className={`px-3 py-1.5 rounded-md font-body text-[0.68rem] tracking-widest uppercase transition-all
              ${filtro === g ? 'bg-[#1a1a1a] text-[#f0ede8] shadow-sm' : 'text-[#555] hover:text-[#888]'}`}>
            {g.charAt(0).toUpperCase() + g.slice(1)}
            <span className={`ml-1.5 font-body text-[0.6rem] ${filtro === g ? 'text-[#c8b99a]' : 'text-[#444]'}`}>
              {fotos.filter(f => f.galeria === g).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtradas.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
          <p className="font-body text-[0.85rem] text-[#444]">Nenhuma foto nesta galeria.</p>
          <button onClick={openModal} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Adicionar a primeira foto</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
          {filtradas.map(f => (
            <div key={f.id} className="relative group rounded-xl overflow-hidden border border-white/[0.06]" style={{ aspectRatio: '1' }}>
              <Image src={safeImageSrc(f.url) || "/logo.png"} alt={f.legenda || ''} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-[#0a0a0a]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                {f.legenda && <p className="font-body text-[0.72rem] text-[#f0ede8] leading-tight">{f.legenda}</p>}
                <button onClick={() => del(f.id)}
                  className="self-end p-2 rounded-lg text-red-400 hover:bg-red-500/[0.15] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>)}

      {modal && (
        <Modal title="Adicionar foto" onClose={() => setModal(false)} size="sm">
          <div className="flex flex-col gap-4">
            <ImageUpload value={url} onChange={setUrl} label="Foto" />
            <div>
              <label className={lbl}>Galeria</label>
              <select className={inp} value={galeria} onChange={e => setGaleria(e.target.value)}>
                {GALERIAS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Legenda (opcional)</label>
              <input className={inp} placeholder="Descreva a foto" value={legenda}
                onChange={e => setLegenda(e.target.value)} />
            </div>
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving || !url}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar foto'}
              </button>
              <button onClick={() => setModal(false)}
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
