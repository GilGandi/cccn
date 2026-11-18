'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/admin/Modal'
import ErrorBox from '@/components/admin/ErrorBox'
import { safeImageSrc } from '@/lib/safeUrl'

type Foto = { id: string; url: string; legenda: string | null; galeria: string; categoriaId: string | null }
type Album = { id: string; nome: string; descricao: string | null; capaUrl: string | null; ordem: number; _count?: { fotos: number } }

const inp = 'w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]'
const lbl = 'block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5'
const btn = 'px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50'

export default function AdminGaleria() {
  const [aba, setAba] = useState<'fotos' | 'albuns'>('fotos')
  const [fotos, setFotos] = useState<Foto[]>([])
  const [albuns, setAlbuns] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [albumUploadId, setAlbumUploadId] = useState('')
  const [filtro, setFiltro] = useState('')
  const [msg, setMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [albumModal, setAlbumModal] = useState<'novo' | 'editar' | null>(null)
  const [albumForm, setAlbumForm] = useState({ nome: '', descricao: '', ordem: '0', capaUrl: '' })
  const [albumEditId, setAlbumEditId] = useState<string | null>(null)
  const [albumMsg, setAlbumMsg] = useState('')
  const [albumSaving, setAlbumSaving] = useState(false)

  const loadFotos = async () => {
    setLoading(true)
    const [f, a] = await Promise.all([
      fetch('/api/fotos', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch('/api/galeria-categorias', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
    ])
    const nextFotos = Array.isArray(f) ? f : []
    const nextAlbuns = Array.isArray(a) ? a : []
    setFotos(nextFotos)
    setAlbuns(nextAlbuns)
    setAlbumUploadId(current => current && nextAlbuns.some((album: Album) => album.id === current) ? current : (nextAlbuns[0]?.id ?? ''))
    setLoading(false)
  }
  useEffect(() => { void loadFotos() }, [])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (!albumUploadId) {
      setMsg('Crie ou selecione um álbum antes de enviar as fotos.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (files.length > 30) {
      setMsg('Selecione até 30 imagens por envio.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    const invalid = files.find(file => !allowedTypes.has(file.type))
    if (invalid) {
      setMsg(`“${invalid.name}” não parece ser uma imagem.`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    setMsg('')
    let cursor = 0
    let completed = 0
    const errors: string[] = []
    setUploadProgress(`Enviando 0 de ${files.length}…`)

    const worker = async () => {
      while (cursor < files.length) {
        const index = cursor++
        const file = files[index]
        try {
          const form = new FormData()
          form.append('file', file)
          const uploadResponse = await fetch('/api/upload', { method: 'POST', body: form })
          const uploaded = await uploadResponse.json()
          if (!uploadResponse.ok || !uploaded.url) throw new Error(uploaded.error || 'Falha no upload da imagem.')

          const saveResponse = await fetch('/api/fotos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: uploaded.url, categoriaId: albumUploadId }),
          })
          const saved = await saveResponse.json()
          if (!saveResponse.ok) throw new Error(saved.error || 'Não foi possível salvar a imagem no álbum.')
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'erro inesperado'}`)
        } finally {
          completed++
          setUploadProgress(`Enviando ${completed} de ${files.length}…`)
        }
      }
    }

    try {
      await Promise.all(Array.from({ length: Math.min(3, files.length) }, () => worker()))
      await loadFotos()
      if (errors.length) setMsg(`${files.length - errors.length} de ${files.length} fotos enviadas. ${errors.slice(0, 3).join(' · ')}${errors.length > 3 ? ` · e mais ${errors.length - 3} erro(s)` : ''}`)
      else setMsg(`${files.length} foto${files.length === 1 ? '' : 's'} adicionada${files.length === 1 ? '' : 's'} ao álbum.`)
    } finally {
      setUploading(false)
      setUploadProgress('')
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const deletarFoto = async (id: string) => {
    if (!confirm('Remover esta foto?')) return
    const response = await fetch(`/api/fotos/${id}`, { method: 'DELETE' })
    if (!response.ok) setMsg('Não foi possível remover a foto.')
    else setMsg('')
    await loadFotos()
  }

  const definirCapa = async (album: Album, url: string) => {
    const response = await fetch(`/api/galeria-categorias/${album.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: album.nome, descricao: album.descricao ?? '', ordem: album.ordem, capaUrl: url }),
    })
    if (response.ok) {
      setMsg(`Capa do álbum “${album.nome}” atualizada.`)
      await loadFotos()
    } else setMsg('Não foi possível atualizar a capa.')
  }

  const openAlbumNovo = () => {
    setAlbumForm({ nome: '', descricao: '', ordem: '0', capaUrl: '' })
    setAlbumEditId(null); setAlbumMsg(''); setAlbumModal('novo')
  }
  const openAlbumEditar = (album: Album) => {
    setAlbumForm({ nome: album.nome, descricao: album.descricao || '', ordem: String(album.ordem), capaUrl: album.capaUrl || '' })
    setAlbumEditId(album.id); setAlbumMsg(''); setAlbumModal('editar')
  }
  const saveAlbum = async () => {
    if (!albumForm.nome.trim()) { setAlbumMsg('O nome do álbum é obrigatório.'); return }
    setAlbumSaving(true); setAlbumMsg('')
    const response = await fetch(albumEditId ? `/api/galeria-categorias/${albumEditId}` : '/api/galeria-categorias', {
      method: albumEditId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...albumForm, ordem: Number(albumForm.ordem) || 0 }),
    })
    if (response.ok) { setAlbumModal(null); await loadFotos() }
    else { const data = await response.json(); setAlbumMsg(data.error || 'Erro ao salvar o álbum.') }
    setAlbumSaving(false)
  }
  const deletarAlbum = async (album: Album) => {
    if (!confirm(`Excluir o álbum “${album.nome}”? As fotos serão mantidas e ficarão sem álbum.`)) return
    const response = await fetch(`/api/galeria-categorias/${album.id}`, { method: 'DELETE' })
    if (!response.ok) setMsg('Não foi possível excluir o álbum.')
    await loadFotos()
  }

  const fotosFiltradas = filtro ? fotos.filter(foto => foto.categoriaId === filtro) : fotos
  const fotosDoAlbumEditado = albumEditId ? fotos.filter(foto => foto.categoriaId === albumEditId) : []

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Galeria</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">{fotos.length} foto{fotos.length === 1 ? '' : 's'} · {albuns.length} álbum{albuns.length === 1 ? '' : 's'}</p>
        </div>
        {aba === 'fotos' && <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Álbum de destino" value={albumUploadId} onChange={event => setAlbumUploadId(event.target.value)} className={`${inp} w-auto min-w-48`} disabled={!albuns.length || uploading}>
            {!albuns.length && <option value="">Crie um álbum primeiro</option>}
            {albuns.map(album => <option key={album.id} value={album.id}>{album.nome}</option>)}
          </select>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleUpload} className="hidden" />
          <button onClick={() => inputRef.current?.click()} disabled={uploading || !albuns.length} className={btn}>
            {uploading ? uploadProgress : '+ Enviar imagens'}
          </button>
        </div>}
        {aba === 'albuns' && <button onClick={openAlbumNovo} className={btn}>+ Novo álbum</button>}
      </div>

      <div className="flex gap-1 mb-6 bg-[#111] border border-white/[0.06] rounded-lg p-1 w-fit">
        {[{ key: 'fotos', label: 'Fotos' }, { key: 'albuns', label: 'Álbuns' }].map(tab => (
          <button key={tab.key} onClick={() => setAba(tab.key as 'fotos' | 'albuns')}
            className={`px-5 py-1.5 rounded-md font-body text-[0.72rem] tracking-widest uppercase transition-all ${aba === tab.key ? 'bg-[#1a1a1a] text-[#f0ede8] shadow-sm' : 'text-[#555] hover:text-[#888]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorBox error={msg} />

      {aba === 'fotos' && <>
        {albuns.length > 0 && <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFiltro('')} className={`px-3 py-1.5 rounded-full font-body text-[0.68rem] tracking-widest uppercase border transition-all ${!filtro ? 'bg-[#c8b99a]/10 border-[#c8b99a]/40 text-[#c8b99a]' : 'border-white/[0.08] text-[#555] hover:text-[#888]'}`}>Todas</button>
          {albuns.map(album => <button key={album.id} onClick={() => setFiltro(album.id)}
            className={`px-3 py-1.5 rounded-full font-body text-[0.68rem] tracking-widest uppercase border transition-all ${filtro === album.id ? 'bg-[#c8b99a]/10 border-[#c8b99a]/40 text-[#c8b99a]' : 'border-white/[0.08] text-[#555] hover:text-[#888]'}`}>{album.nome}</button>)}
        </div>}
        {loading ? <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" /></div>
          : fotosFiltradas.length === 0 ? <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
            <p className="font-body text-[0.85rem] text-[#777]">{albuns.length ? 'Nenhuma foto neste filtro. Selecione um álbum e envie imagens.' : 'Crie um álbum para começar a organizar as fotos.'}</p>
            {!albuns.length && <button onClick={() => { setAba('albuns'); openAlbumNovo() }} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Criar o primeiro álbum</button>}
          </div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {fotosFiltradas.map(foto => {
              const src = safeImageSrc(foto.url)
              if (!src) return null
              const album = albuns.find(item => item.id === foto.categoriaId)
              return <div key={foto.id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/[0.04]">
                <Image src={src} alt={foto.legenda || 'Foto'} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {album && <button onClick={() => definirCapa(album, foto.url)} className="px-3 py-2 rounded-lg bg-[#c8b99a] text-[#111] text-xs font-semibold">{album.capaUrl === foto.url ? 'Capa atual' : 'Usar como capa'}</button>}
                  <button onClick={() => deletarFoto(foto.id)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs">Remover foto</button>
                </div>
              </div>
            })}
          </div>}
      </>}

      {aba === 'albuns' && <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {!albuns.length && <div className="col-span-full text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
          <p className="font-body text-[0.85rem] text-[#777]">Nenhum álbum criado ainda.</p>
          <button onClick={openAlbumNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Criar o primeiro álbum</button>
        </div>}
        {albuns.map(album => {
          const cover = safeImageSrc(album.capaUrl || fotos.find(foto => foto.categoriaId === album.id)?.url || '')
          return <div key={album.id} className="flex gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#191919]">
              {cover && <Image src={cover} alt={`Capa do álbum ${album.nome}`} fill className="object-cover" unoptimized />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body text-[0.9rem] text-[#f0ede8]">{album.nome}</div>
              <div className="font-body text-[0.72rem] text-[#777] mt-1">{album._count?.fotos ?? fotos.filter(foto => foto.categoriaId === album.id).length} fotos</div>
              {album.descricao && <p className="font-body text-[0.72rem] text-[#555] mt-1 line-clamp-2">{album.descricao}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setFiltro(album.id); setAlbumUploadId(album.id); setAba('fotos') }} className="text-xs text-[#c8b99a] hover:underline">Ver fotos</button>
                <button onClick={() => openAlbumEditar(album)} className="text-xs text-[#aaa] hover:text-white">Editar</button>
                <button onClick={() => deletarAlbum(album)} className="text-xs text-red-400 hover:text-red-300">Excluir</button>
              </div>
            </div>
          </div>
        })}
      </div>}

      {albumModal && <Modal title={albumModal === 'novo' ? 'Novo álbum' : 'Editar álbum'} onClose={() => setAlbumModal(null)} size="sm">
        <div className="flex flex-col gap-4">
          <div><label className={lbl}>Nome do álbum *</label><input className={inp} placeholder="Ex.: Culto de Natal 2026" value={albumForm.nome} autoFocus onChange={event => setAlbumForm({ ...albumForm, nome: event.target.value })} /></div>
          <div><label className={lbl}>Descrição</label><textarea className={`${inp} min-h-24 resize-y`} placeholder="Conte um pouco sobre este álbum" value={albumForm.descricao} onChange={event => setAlbumForm({ ...albumForm, descricao: event.target.value })} /></div>
          <div><label className={lbl}>Ordem de exibição</label><input type="number" className={inp} min="0" value={albumForm.ordem} onChange={event => setAlbumForm({ ...albumForm, ordem: event.target.value })} /></div>
          {albumModal === 'editar' && <div><label className={lbl}>Imagem de capa</label>
            {fotosDoAlbumEditado.length ? <select className={inp} value={albumForm.capaUrl} onChange={event => setAlbumForm({ ...albumForm, capaUrl: event.target.value })}>
              <option value="">Usar a primeira foto do álbum</option>
              {fotosDoAlbumEditado.map(foto => <option key={foto.id} value={foto.url}>Imagem {fotosDoAlbumEditado.indexOf(foto) + 1}</option>)}
            </select> : <p className="text-xs text-[#666]">Envie fotos para este álbum para escolher uma como capa.</p>}
          </div>}
          <ErrorBox error={albumMsg} />
          <div className="flex gap-2">
            <button onClick={saveAlbum} disabled={albumSaving} className={`${btn} flex-1`}>{albumSaving ? 'Salvando…' : albumModal === 'novo' ? 'Criar álbum' : 'Salvar alterações'}</button>
            <button onClick={() => setAlbumModal(null)} className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">Cancelar</button>
          </div>
        </div>
      </Modal>}
    </div>
  )
}
