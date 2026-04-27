'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'
import ErrorBox from '@/components/admin/ErrorBox'
import { safeImageSrc } from '@/lib/safeUrl'

type Foto = { id: string; url: string; legenda: string | null; galeria: string; categoriaId: string | null }
type Cat  = { id: string; nome: string; descricao: string | null; ordem: number; _count?: { fotos: number } }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

export default function AdminGaleria() {
  const [aba, setAba]         = useState<'fotos'|'categorias'>('fotos')
  const [fotos, setFotos]     = useState<Foto[]>([])
  const [cats, setCats]       = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filtro, setFiltro]   = useState('')
  const [msg, setMsg]         = useState('')
  const inputRef              = useRef<HTMLInputElement>(null)

  // Estados para modal de categoria
  const [catModal, setCatModal] = useState<'novo'|'editar'|null>(null)
  const [catForm, setCatForm]   = useState({ nome: '', descricao: '', ordem: '0' })
  const [catEditId, setCatEditId] = useState<string|null>(null)
  const [catMsg, setCatMsg]     = useState('')
  const [catSaving, setCatSaving] = useState(false)

  const loadFotos = async () => {
    setLoading(true)
    const [f, c] = await Promise.all([
      fetch('/api/fotos').then(r => r.json()).catch(() => []),
      fetch('/api/galeria-categorias').then(r => r.json()).catch(() => []),
    ])
    setFotos(Array.isArray(f) ? f : [])
    setCats(Array.isArray(c) ? c : [])
    setLoading(false)
  }
  useEffect(() => { loadFotos() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setMsg('')
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd })
    const d = await r.json()
    if (r.ok) {
      await fetch('/api/fotos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: d.url, galeria: filtro || 'geral' }),
      })
      loadFotos()
    } else { setMsg(d.error || 'Erro no upload.') }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const deletarFoto = async (id: string) => {
    if (!confirm('Remover esta foto?')) return
    await fetch(`/api/fotos/${id}`, { method: 'DELETE' })
    loadFotos()
    setMsg('')
  }

  // CRUD categorias
  const openCatNovo   = () => { setCatForm({ nome:'', descricao:'', ordem:'0' }); setCatEditId(null); setCatMsg(''); setCatModal('novo') }
  const openCatEditar = (c: Cat) => { setCatForm({ nome:c.nome, descricao:c.descricao||'', ordem:String(c.ordem) }); setCatEditId(c.id); setCatMsg(''); setCatModal('editar') }
  const saveCat = async () => {
    if (!catForm.nome.trim()) { setCatMsg('Nome é obrigatório.'); return }
    setCatSaving(true); setCatMsg('')
    const url = catEditId ? `/api/galeria-categorias/${catEditId}` : '/api/galeria-categorias'
    const method = catEditId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...catForm, ordem: Number(catForm.ordem)||0 }) })
    if (r.ok) { setCatModal(null); loadFotos() }
    else { const d = await r.json(); setCatMsg(d.error||'Erro ao salvar.') }
    setCatSaving(false)
  }
  const deletarCat = async (c: Cat) => {
    if (!confirm(`Excluir categoria "${c.nome}"? As fotos não serão apagadas.`)) return
    await fetch(`/api/galeria-categorias/${c.id}`, { method:'DELETE' })
    loadFotos()
  }

  const fotosFiltradas = filtro ? fotos.filter(f => f.galeria === filtro || f.categoriaId === filtro) : fotos

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Galeria</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">{fotos.length} foto{fotos.length !== 1 ? 's' : ''} no total</p>
        </div>
        {aba === 'fotos' && (
          <div className="flex gap-2">
            <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button onClick={() => inputRef.current?.click()} disabled={uploading}
              className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
              {uploading ? 'Enviando...' : '+ Adicionar foto'}
            </button>
          </div>
        )}
        {aba === 'categorias' && (
          <button onClick={openCatNovo}
            className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
            + Nova categoria
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 bg-[#111] border border-white/[0.06] rounded-lg p-1 w-fit">
        {[{k:'fotos',l:'Fotos'},{k:'categorias',l:'Categorias'}].map(t => (
          <button key={t.k} onClick={() => setAba(t.k as any)}
            className={`px-5 py-1.5 rounded-md font-body text-[0.72rem] tracking-widest uppercase transition-all
              ${aba===t.k ? 'bg-[#1a1a1a] text-[#f0ede8] shadow-sm' : 'text-[#555] hover:text-[#888]'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Aba Fotos */}
      {aba === 'fotos' && (
        <>
          <ErrorBox error={msg} />

          {/* Filtro por categoria */}
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setFiltro('')}
                className={`px-3 py-1.5 rounded-full font-body text-[0.68rem] tracking-widest uppercase border transition-all
                  ${!filtro ? 'bg-[#c8b99a]/10 border-[#c8b99a]/40 text-[#c8b99a]' : 'border-white/[0.08] text-[#555] hover:text-[#888]'}`}>
                Todas
              </button>
              {cats.map(c => (
                <button key={c.id} onClick={() => setFiltro(c.id)}
                  className={`px-3 py-1.5 rounded-full font-body text-[0.68rem] tracking-widest uppercase border transition-all
                    ${filtro===c.id ? 'bg-[#c8b99a]/10 border-[#c8b99a]/40 text-[#c8b99a]' : 'border-white/[0.08] text-[#555] hover:text-[#888]'}`}>
                  {c.nome}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" /></div>
          ) : fotosFiltradas.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
              <p className="font-body text-[0.85rem] text-[#444]">Nenhuma foto. Clique em "Adicionar foto" para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {fotosFiltradas.map(f => {
                const src = safeImageSrc(f.url)
                if (!src) return null
                return (
                  <div key={f.id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/[0.04]">
                    <Image src={src} alt={f.legenda||'Foto'} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deletarFoto(f.id)}
                        className="p-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Aba Categorias */}
      {aba === 'categorias' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {cats.length === 0 && (
            <div className="col-span-2 text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
              <p className="font-body text-[0.85rem] text-[#444]">Nenhuma categoria criada.</p>
              <button onClick={openCatNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Criar a primeira</button>
            </div>
          )}
          {cats.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
              <div className="flex-1 min-w-0">
                <div className="font-body text-[0.88rem] text-[#f0ede8]">{c.nome}</div>
                <div className="font-body text-[0.72rem] text-[#555] mt-0.5">
                  {c._count?.fotos ?? 0} foto{(c._count?.fotos ?? 0) !== 1 ? 's' : ''}
                  {c.descricao && ` · ${c.descricao}`}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openCatEditar(c)}
                  className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => deletarCat(c)}
                  className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {catModal && (
        <Modal title={catModal==='novo'?'Nova categoria':'Editar categoria'} onClose={() => setCatModal(null)} size="sm">
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Nome *</label>
              <input className={inp} placeholder="Ex: Culto, Retiro, Jovens..." value={catForm.nome} autoFocus
                onChange={e => setCatForm({...catForm, nome: e.target.value})} />
            </div>
            <div>
              <label className={lbl}>Descrição</label>
              <input className={inp} placeholder="Opcional" value={catForm.descricao}
                onChange={e => setCatForm({...catForm, descricao: e.target.value})} />
            </div>
            <div>
              <label className={lbl}>Ordem de exibição</label>
              <input type="number" className={inp} min="0" value={catForm.ordem}
                onChange={e => setCatForm({...catForm, ordem: e.target.value})} />
            </div>
            <ErrorBox error={catMsg} />
            <div className="flex gap-2">
              <button onClick={saveCat} disabled={catSaving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {catSaving?'Salvando...':catModal==='novo'?'Criar':'Salvar'}
              </button>
              <button onClick={() => setCatModal(null)}
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
