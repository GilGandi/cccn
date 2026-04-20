'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import ImageUpload from '@/components/admin/ImageUpload'

type Foto = { id: string; url: string; legenda: string | null; galeria: string; ordem: number; createdAt: string }

const GALERIAS = ['geral', 'cultos', 'jovens', 'homens', 'mulheres', 'familia', 'eventos']

export default function AdminGaleria() {
  const [fotos, setFotos]         = useState<Foto[]>([])
  const [filtro, setFiltro]       = useState('geral')
  const [url, setUrl]             = useState('')
  const [legenda, setLegenda]     = useState('')
  const [galeria, setGaleria]     = useState('geral')
  const [loading, setLoading]     = useState(false)
  const [msg, setMsg]             = useState('')

  const inp = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"

  const load = async () => {
    const r = await fetch('/api/fotos')
    const d = await r.json()
    setFotos(Array.isArray(d) ? d : [])
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) { setMsg('Envie uma foto primeiro.'); return }
    setLoading(true); setMsg('')
    const r = await fetch('/api/fotos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, legenda: legenda || null, galeria }),
    })
    if (r.ok) { setMsg('Foto adicionada!'); setUrl(''); setLegenda(''); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm('Deletar esta foto?')) return
    await fetch(`/api/fotos/${id}`, { method: 'DELETE' })
    load()
  }

  const filtradas = fotos.filter(f => f.galeria === filtro)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Galeria</h1>
        <p className="font-body text-[0.82rem] text-[#888480]">Gerencie as fotos da comunidade</p>
      </div>

      {/* Upload form */}
      <form onSubmit={save} className="mb-8 p-5 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
        <h2 className="font-display text-[1.1rem] text-[#f0ede8]">Adicionar foto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <ImageUpload
              value={url}
              onChange={setUrl}
              label="Foto"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Galeria</label>
            <select value={galeria} onChange={e => setGaleria(e.target.value)} className={inp}>
              {GALERIAS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Legenda (opcional)</label>
            <input value={legenda} onChange={e => setLegenda(e.target.value)} className={inp} placeholder="Descreva a foto"/>
          </div>
        </div>
        {msg && <p className={`font-body text-[0.8rem] ${msg.includes('!') ? 'text-[#8ec88e]' : 'text-red-400'}`}>{msg}</p>}
        <button type="submit" disabled={loading || !url}
          className="self-start px-6 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar foto'}
        </button>
      </form>

      {/* Filtro galerias */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GALERIAS.map(g => (
          <button key={g} onClick={() => setFiltro(g)}
            className={`px-4 py-1.5 font-body text-[0.65rem] tracking-widest uppercase rounded transition-colors border ${filtro === g ? 'bg-[#f0ede8] text-[#0a0a0a] border-[#f0ede8]' : 'text-[#888480] border-[rgba(240,237,232,0.15)] hover:text-[#f0ede8]'}`}>
            {g.charAt(0).toUpperCase() + g.slice(1)} ({fotos.filter(f => f.galeria === g).length})
          </button>
        ))}
      </div>

      {/* Grid fotos */}
      {filtradas.length === 0 ? (
        <p className="font-body text-[0.85rem] text-[#888480] py-10 text-center">Nenhuma foto nesta galeria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {filtradas.map(f => (
            <div key={f.id} className="relative group rounded overflow-hidden border border-[rgba(240,237,232,0.08)]" style={{ aspectRatio: '1' }}>
              <Image src={f.url} alt={f.legenda || ''} fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 bg-[#0a0a0a]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                {f.legenda && <p className="font-body text-[0.72rem] text-[#f0ede8] leading-tight">{f.legenda}</p>}
                <button onClick={() => del(f.id)}
                  className="self-end px-3 py-1 font-body text-[0.62rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.3)] hover:bg-[rgba(255,100,100,0.15)] transition-colors rounded">
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
