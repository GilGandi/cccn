'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/admin/Modal'
import { safeImageSrc } from '@/lib/safeUrl'

type Foto = { id: string; url: string; legenda: string | null; galeria: string; categoriaId: string | null }
type Album = { id: string; nome: string; descricao: string | null; ordem: number; capaUrl: string | null; _count?: { fotos: number } }
type Feedback = { type: 'success' | 'error'; text: string }

const MAX_IMAGES_PER_BATCH = 30
const inp = 'w-full bg-[#0f0f0f] border border-white/[0.12] text-[#f0ede8] font-body text-[0.88rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/60 transition-colors placeholder:text-[#777]'
const lbl = 'block font-body text-[0.68rem] tracking-[0.12em] uppercase text-[#aaa] mb-1.5'
const primaryButton = 'px-4 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
const secondaryButton = 'px-4 py-2.5 border border-white/[0.14] text-[#ddd] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-white/[0.06] transition-all'

export default function AdminGaleria() {
  const [aba, setAba] = useState<'fotos' | 'albuns'>('fotos')
  const [fotos, setFotos] = useState<Foto[]>([])
  const [albuns, setAlbuns] = useState<Album[]>([])
  const [albumAtivo, setAlbumAtivo] = useState('all')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [albumModal, setAlbumModal] = useState<'novo' | 'editar' | null>(null)
  const [albumEditId, setAlbumEditId] = useState<string | null>(null)
  const [albumForm, setAlbumForm] = useState({ nome: '', descricao: '', ordem: '0' })
  const [albumSaving, setAlbumSaving] = useState(false)
  const [albumError, setAlbumError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  const loadGallery = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [fotosRes, albunsRes] = await Promise.all([fetch('/api/fotos'), fetch('/api/galeria-categorias')])
      const [fotosData, albunsData] = await Promise.all([fotosRes.json(), albunsRes.json()])
      const nextFotos = Array.isArray(fotosData) ? fotosData : []
      const nextAlbuns = Array.isArray(albunsData) ? albunsData : []
      setFotos(nextFotos)
      setAlbuns(nextAlbuns)
      if (!initialized.current) {
        initialized.current = true
        if (nextAlbuns.length) setAlbumAtivo(nextAlbuns[0].id)
      }
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível carregar a galeria. Tente novamente.' })
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => { void loadGallery() }, [])
  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 6500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const fotosVisiveis = fotos.filter(foto => {
    if (albumAtivo === 'all') return true
    if (albumAtivo === 'unassigned') return !foto.categoriaId
    return foto.categoriaId === albumAtivo
  })
  const albumSelecionado = albuns.find(album => album.id === albumAtivo)
  const podeEnviar = Boolean(albumSelecionado) && !uploading

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    const resetInput = () => { if (inputRef.current) inputRef.current.value = '' }
    if (files.length > MAX_IMAGES_PER_BATCH) {
      setFeedback({ type: 'error', text: `Selecione no máximo ${MAX_IMAGES_PER_BATCH} imagens por envio. Você selecionou ${files.length}.` })
      resetInput()
      return
    }
    if (!albumSelecionado) {
      setFeedback({ type: 'error', text: 'Escolha um álbum específico antes de enviar as imagens.' })
      resetInput()
      return
    }
    const tiposAceitos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const invalidFile = files.find(file => !tiposAceitos.includes(file.type))
    if (invalidFile) {
      setFeedback({ type: 'error', text: `“${invalidFile.name}” não é JPEG, PNG, WebP ou GIF. Nenhuma imagem foi enviada.` })
      resetInput()
      return
    }
    const grande = files.find(file => file.size > 10 * 1024 * 1024)
    if (grande) {
      setFeedback({ type: 'error', text: `“${grande.name}” ultrapassa o limite de 10 MB por imagem. Nenhuma imagem foi enviada.` })
      resetInput()
      return
    }

    setUploading(true)
    setFeedback(null)
    const concluidas: string[] = []
    const falhas: string[] = []
    for (const [index, file] of files.entries()) {
      setUploadProgress(`Enviando ${index + 1} de ${files.length}…`)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok || !uploadData.url) throw new Error(uploadData.error || 'Falha ao armazenar a imagem.')

        const fotoRes = await fetch('/api/fotos', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: uploadData.url, categoriaId: albumSelecionado.id, galeria: 'geral' }),
        })
        const fotoData = await fotoRes.json()
        if (!fotoRes.ok) throw new Error(fotoData.error || 'Falha ao adicionar a imagem ao álbum.')
        concluidas.push(file.name)
      } catch (error) {
        falhas.push(`${file.name}: ${error instanceof Error ? error.message : 'falha no envio'}`)
      }
    }

    await loadGallery(false)
    setUploading(false)
    setUploadProgress('')
    resetInput()
    if (falhas.length === 0) {
      setFeedback({ type: 'success', text: `${concluidas.length} ${concluidas.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'} ao álbum “${albumSelecionado.nome}”.` })
    } else if (concluidas.length > 0) {
      setFeedback({ type: 'error', text: `${concluidas.length} enviada(s); ${falhas.length} não concluída(s). ${falhas[0]}` })
    } else {
      setFeedback({ type: 'error', text: `Não foi possível enviar as imagens. ${falhas[0]}` })
    }
  }

  const abrirNovoAlbum = () => {
    setAlbumForm({ nome: '', descricao: '', ordem: String(albuns.length) })
    setAlbumEditId(null)
    setAlbumError('')
    setAlbumModal('novo')
  }

  const abrirEdicaoAlbum = (album: Album) => {
    setAlbumForm({ nome: album.nome, descricao: album.descricao || '', ordem: String(album.ordem) })
    setAlbumEditId(album.id)
    setAlbumError('')
    setAlbumModal('editar')
  }

  const salvarAlbum = async () => {
    if (!albumForm.nome.trim()) { setAlbumError('Informe um nome para o álbum.'); return }
    setAlbumSaving(true)
    setAlbumError('')
    try {
      const url = albumEditId ? `/api/galeria-categorias/${albumEditId}` : '/api/galeria-categorias'
      const response = await fetch(url, {
        method: albumEditId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...albumForm, ordem: Number(albumForm.ordem) || 0 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o álbum.')
      setAlbumModal(null)
      if (!albumEditId && data.id) setAlbumAtivo(data.id)
      await loadGallery(false)
      setFeedback({ type: 'success', text: albumEditId ? 'Álbum atualizado.' : 'Álbum criado. Agora você pode enviar fotos ou escolher uma capa.' })
    } catch (error) {
      setAlbumError(error instanceof Error ? error.message : 'Não foi possível salvar o álbum.')
    } finally {
      setAlbumSaving(false)
    }
  }

  const definirCapa = async (foto: Foto) => {
    if (!albumSelecionado) return
    try {
      const response = await fetch(`/api/galeria-categorias/${albumSelecionado.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capaUrl: foto.url }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a capa.')
      setAlbuns(current => current.map(album => album.id === data.id ? { ...album, capaUrl: data.capaUrl } : album))
      setFeedback({ type: 'success', text: `Capa do álbum “${albumSelecionado.nome}” atualizada.` })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível atualizar a capa.' })
    }
  }

  const excluirAlbum = async (album: Album) => {
    if (!confirm(`Excluir o álbum “${album.nome}”? As fotos serão mantidas em “Sem álbum”.`)) return
    try {
      const response = await fetch(`/api/galeria-categorias/${album.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível excluir o álbum.')
      if (albumAtivo === album.id) setAlbumAtivo('all')
      await loadGallery(false)
      setFeedback({ type: 'success', text: `Álbum “${album.nome}” excluído. As fotos foram mantidas.` })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível excluir o álbum.' })
    }
  }

  const excluirFoto = async (foto: Foto) => {
    if (!confirm('Remover esta foto da galeria?')) return
    const response = await fetch(`/api/fotos/${foto.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setFeedback({ type: 'error', text: data.error || 'Não foi possível remover a foto.' })
      return
    }
    await loadGallery(false)
    setFeedback({ type: 'success', text: 'Foto removida da galeria.' })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.9rem] text-[#f0ede8] leading-tight">Galeria</h1>
          <p className="font-body text-[0.9rem] text-[#aaa] mt-1">
            {fotos.length} foto{fotos.length !== 1 ? 's' : ''} · {albuns.length} álbum{albuns.length !== 1 ? 's' : ''}
          </p>
        </div>
        {aba === 'albuns' && <button onClick={abrirNovoAlbum} className={primaryButton}>+ Criar álbum</button>}
      </header>

      <div role="tablist" aria-label="Seções da galeria" className="flex gap-1 bg-[#111] border border-white/[0.09] rounded-lg p-1 w-fit">
        {([{ key: 'fotos', label: 'Fotos' }, { key: 'albuns', label: 'Álbuns' }] as const).map(tab => (
          <button key={tab.key} role="tab" aria-selected={aba === tab.key} onClick={() => setAba(tab.key)}
            className={`px-5 py-2 rounded-md font-body text-[0.76rem] tracking-widest uppercase transition-all ${aba === tab.key ? 'bg-[#24221e] text-[#f0ede8]' : 'text-[#aaa] hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div role="status" aria-live="polite" className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-[0.88rem] ${feedback.type === 'success' ? 'border-emerald-400/30 bg-emerald-950/50 text-emerald-200' : 'border-red-400/30 bg-red-950/40 text-red-200'}`}>
          <span aria-hidden="true" className="font-bold">{feedback.type === 'success' ? '✓' : '!'}</span>
          <span>{feedback.text}</span>
          <button aria-label="Fechar mensagem" onClick={() => setFeedback(null)} className="ml-auto pl-3 text-current/70 hover:text-current">×</button>
        </div>
      )}

      {aba === 'fotos' && (
        <>
          <section aria-label="Controles de álbum e envio" className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 rounded-xl border border-white/[0.1] bg-[#111] p-4 sm:p-5">
            <div className="w-full lg:max-w-md">
              <label htmlFor="album-selector" className={lbl}>Álbum para visualizar e receber envios</label>
              <select id="album-selector" value={albumAtivo} disabled={uploading} onChange={event => setAlbumAtivo(event.target.value)} className={inp}>
                <option value="all">Todos os álbuns — somente visualização</option>
                <option value="unassigned">Sem álbum — somente visualização</option>
                {albuns.map(album => <option key={album.id} value={album.id}>{album.nome}</option>)}
              </select>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-[#b4b0a9]">
                {albumSelecionado ? <>As próximas imagens serão adicionadas a <strong className="text-[#f0ede8]">{albumSelecionado.nome}</strong>.</> : 'Para enviar imagens, selecione um álbum específico nesta lista.'}
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-2">
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleUpload} className="hidden" aria-label="Selecionar imagens para enviar" />
              <button onClick={() => inputRef.current?.click()} disabled={!podeEnviar} className={primaryButton}>
                {uploading ? uploadProgress : '+ Enviar imagens'}
              </button>
              <p className="text-[0.78rem] leading-relaxed text-[#b4b0a9] lg:text-right">
                Até <strong className="text-[#f0ede8]">30 imagens por envio</strong> · JPEG, PNG, WebP ou GIF · máx. 10 MB cada
              </p>
            </div>
          </section>

          {albumAtivo === 'all' && fotos.length > 0 && <p className="text-[0.8rem] text-[#aaa]">Mostrando a galeria completa. Escolha um álbum na lista para filtrar e enviar fotos.</p>}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-7 h-7 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" aria-label="Carregando galeria" /></div>
          ) : fotosVisiveis.length === 0 ? (
            <div className="text-center py-16 px-5 border border-dashed border-white/[0.14] rounded-xl">
              <p className="font-body text-[0.95rem] text-[#ddd]">{albuns.length === 0 ? 'Crie um álbum para começar a organizar suas fotos.' : albumAtivo === 'all' ? 'Ainda não há fotos na galeria.' : albumAtivo === 'unassigned' ? 'Não há fotos sem álbum.' : `O álbum “${albumSelecionado?.nome}” ainda não tem fotos.`}</p>
              {albuns.length === 0 && <button onClick={() => { setAba('albuns'); abrirNovoAlbum() }} className="mt-4 underline text-[#d6c7a9]">Criar primeiro álbum</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
              {fotosVisiveis.map(foto => {
                const src = safeImageSrc(foto.url)
                if (!src) return null
                const isCover = albumSelecionado?.capaUrl === foto.url
                return (
                  <div key={foto.id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/[0.08]">
                    <Image src={src} alt={foto.legenda || `Foto do álbum ${albumSelecionado?.nome || 'da galeria'}`} fill className="object-cover" unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                    {isCover && <span className="absolute left-2 top-2 rounded-full bg-[#c8b99a] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[#16130e]">Capa</span>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {albumSelecionado && <button onClick={() => void definirCapa(foto)} disabled={isCover} className="rounded-md bg-white/95 px-3 py-2 text-[0.68rem] font-semibold text-[#171512] disabled:opacity-60">{isCover ? 'Capa atual' : 'Usar como capa'}</button>}
                      <button onClick={() => void excluirFoto(foto)} aria-label="Remover foto" className="rounded-md bg-red-950/90 px-3 py-2 text-[0.68rem] font-semibold text-red-100">Remover foto</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {aba === 'albuns' && (
        albuns.length === 0 ? (
          <div className="text-center py-16 px-5 border border-dashed border-white/[0.14] rounded-xl">
            <p className="font-body text-[0.95rem] text-[#ddd]">Nenhum álbum criado ainda.</p>
            <p className="font-body text-[0.85rem] text-[#aaa] mt-2">Crie um álbum com nome e descrição; depois escolha uma foto como capa.</p>
            <button onClick={abrirNovoAlbum} className={`${primaryButton} mt-5`}>Criar primeiro álbum</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {albuns.map(album => {
              const cover = album.capaUrl ? safeImageSrc(album.capaUrl) : null
              return (
                <article key={album.id} className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#111]">
                  <button onClick={() => { setAlbumAtivo(album.id); setAba('fotos') }} className="relative block aspect-[16/8] w-full bg-[#191919] text-left">
                    {cover ? <Image src={cover} alt={`Capa do álbum ${album.nome}`} fill className="object-cover" unoptimized sizes="(max-width: 768px) 100vw, 50vw" /> : <div className="flex h-full items-center justify-center text-[#888] text-sm">Sem capa · clique para abrir</div>}
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">Abrir álbum</span>
                  </button>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display text-[1.2rem] leading-snug text-[#f0ede8]">{album.nome}</h2>
                        <p className="mt-1 text-[0.82rem] text-[#b4b0a9]">{album._count?.fotos ?? 0} foto{(album._count?.fotos ?? 0) !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => abrirEdicaoAlbum(album)} className="rounded-md border border-white/[0.13] px-2.5 py-2 text-xs text-[#ddd] hover:bg-white/[0.06]">Editar</button>
                        <button onClick={() => void excluirAlbum(album)} className="rounded-md border border-red-400/25 px-2.5 py-2 text-xs text-red-200 hover:bg-red-950/40">Excluir</button>
                      </div>
                    </div>
                    {album.descricao && <p className="mt-3 text-[0.88rem] leading-relaxed text-[#c2beb7]">{album.descricao}</p>}
                  </div>
                </article>
              )
            })}
          </div>
        )
      )}

      {albumModal && (
        <Modal title={albumModal === 'novo' ? 'Criar álbum' : 'Editar álbum'} onClose={() => setAlbumModal(null)} size="sm">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="album-name" className={lbl}>Nome do álbum *</label>
              <input id="album-name" className={inp} maxLength={100} placeholder="Ex.: Culto de Natal 2026" value={albumForm.nome} autoFocus onChange={event => setAlbumForm({ ...albumForm, nome: event.target.value })} />
            </div>
            <div>
              <label htmlFor="album-description" className={lbl}>Descrição</label>
              <textarea id="album-description" className={`${inp} min-h-24 resize-y`} maxLength={300} placeholder="Conte um pouco sobre estas fotos (opcional)" value={albumForm.descricao} onChange={event => setAlbumForm({ ...albumForm, descricao: event.target.value })} />
              <p className="mt-1 text-right text-xs text-[#999]">{albumForm.descricao.length}/300</p>
            </div>
            <div>
              <label htmlFor="album-order" className={lbl}>Ordem de exibição</label>
              <input id="album-order" type="number" className={inp} min="0" value={albumForm.ordem} onChange={event => setAlbumForm({ ...albumForm, ordem: event.target.value })} />
            </div>
            {albumError && <p role="alert" className="rounded-md border border-red-400/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">{albumError}</p>}
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button onClick={() => setAlbumModal(null)} className={secondaryButton}>Cancelar</button>
              <button onClick={() => void salvarAlbum()} disabled={albumSaving} className={`${primaryButton} flex-1`}>{albumSaving ? 'Salvando…' : albumModal === 'novo' ? 'Criar álbum' : 'Salvar alterações'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
