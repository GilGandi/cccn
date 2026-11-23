'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

type Midia = { id: string; url: string; thumbnailUrl?: string; legenda: null; tipo?: 'imagem' | 'video' }
type Album = {
  id: string
  nome: string
  descricao: string | null
  capaUrl: string | null
  categoria: string | null
  fotos: Midia[]
}
type GalleryResponse = { albuns?: Album[]; nomePasta?: string; error?: string }

const inputClass = 'mt-1 w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-3 py-2.5 text-sm text-[#f0ede8] outline-none transition focus:border-[#c8b99a]/60'

function isVideo(item: Midia): boolean {
  return item.tipo === 'video' || /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|webm|wmv)(?:$|[?#])/i.test(item.url)
}

export default function AdminGaleria() {
  const [albuns, setAlbuns] = useState<Album[]>([])
  const [nomePasta, setNomePasta] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [salvandoId, setSalvandoId] = useState('')
  const [albumSeletorCapaId, setAlbumSeletorCapaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const response = await fetch('/api/galeria-drive', { cache: 'no-store' })
      const data = await response.json() as GalleryResponse
      if (!response.ok) throw new Error(data.error || 'Não foi possível acessar a pasta pública do Google Drive.')
      setAlbuns(data.albuns ?? [])
      setNomePasta(data.nomePasta ?? '')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar a galeria.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])
  useEffect(() => {
    if (!albumSeletorCapaId) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const fecharComEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setAlbumSeletorCapaId(null) }
    window.addEventListener('keydown', fecharComEscape)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', fecharComEscape)
    }
  }, [albumSeletorCapaId])

  const total = albuns.reduce((sum, album) => sum + album.fotos.length, 0)
  const totalVideos = albuns.reduce((sum, album) => sum + album.fotos.filter(isVideo).length, 0)
  const totalFotos = total - totalVideos
  const categorias = useMemo(() => [...new Set(albuns.map(album => album.categoria?.trim()).filter((item): item is string => Boolean(item)))], [albuns])
  const albumSeletorCapa = albuns.find(album => album.id === albumSeletorCapaId) ?? null

  const atualizarAlbum = (albumId: string, patch: Partial<Album>) => {
    setAlbuns(current => current.map(album => album.id === albumId ? { ...album, ...patch } : album))
    setAviso('')
  }

  const escolherCapa = (album: Album, item: Midia | null) => {
    atualizarAlbum(album.id, { capaUrl: item ? (item.thumbnailUrl || item.url) : null })
    setAlbumSeletorCapaId(null)
  }

  const salvarAlbum = async (album: Album) => {
    setSalvandoId(album.id)
    setErro('')
    setAviso('')
    try {
      const response = await fetch('/api/galeria-drive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId: album.id, nome: album.nome, descricao: album.descricao, categoria: album.categoria, capaUrl: album.capaUrl }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o álbum.')
      setAviso(`Álbum “${album.nome}” salvo.`)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o álbum.')
    } finally {
      setSalvandoId('')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.9rem] leading-tight text-[#f0ede8]">Galeria</h1>
          <p className="mt-1 font-body text-[0.9rem] text-[#aaa]">{totalFotos} foto{totalFotos === 1 ? '' : 's'} · {totalVideos} vídeo{totalVideos === 1 ? '' : 's'} · {albuns.length} álbum{albuns.length === 1 ? '' : 's'}{nomePasta ? ` · ${nomePasta}` : ''}</p>
        </div>
        <button type="button" onClick={() => void carregar()} disabled={loading} className="rounded-md bg-[#c8b99a] px-4 py-2.5 font-body text-[0.72rem] font-semibold uppercase tracking-widest text-[#0a0a0a] transition-all hover:bg-[#d4c8b0] disabled:opacity-50">
          {loading ? 'Atualizando…' : 'Atualizar pastas'}
        </button>
      </header>

      <aside className="rounded-xl border border-white/[0.1] bg-[#111] p-4 text-[0.88rem] leading-relaxed text-[#b4b0a9] sm:p-5">
        Fotos e vídeos são somente leitura e vêm do Google Drive. Cada subpasta é um álbum; organize os arquivos no Drive e configure aqui a capa, a descrição e a categoria que aparecerão no site. Os nomes dos arquivos não são exibidos.
      </aside>

      {erro && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{erro}</p>}
      {aviso && <p role="status" className="rounded-lg border border-emerald-400/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">{aviso}</p>}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c8b99a]/30 border-t-[#c8b99a]" aria-label="Carregando galeria" /></div>
      ) : albuns.length === 0 && !erro ? (
        <p className="rounded-xl border border-dashed border-white/[0.14] px-5 py-16 text-center font-body text-[0.95rem] text-[#aaa]">A pasta pública não contém subpastas. Crie uma subpasta no Drive para cada álbum.</p>
      ) : (
        <div className="space-y-6">
          {albuns.map(album => {
            const imagens = album.fotos.filter(item => !isVideo(item))
            const videos = album.fotos.filter(isVideo)
            const capaSelecionada = imagens.find(item => album.capaUrl === (item.thumbnailUrl || item.url))
            const capaPreview = safeImageSrc(capaSelecionada?.thumbnailUrl || capaSelecionada?.url || imagens[0]?.thumbnailUrl || imagens[0]?.url || '')
            return (
              <section key={album.id} aria-label={`Configurar álbum ${album.nome}`} className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#111]">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-6">
                  <div>
                    <h2 className="font-display text-xl text-[#f0ede8]">{album.nome}</h2>
                    <p className="mt-1 font-body text-xs text-[#999]">{imagens.length} foto{imagens.length === 1 ? '' : 's'} · {videos.length} vídeo{videos.length === 1 ? '' : 's'}</p>
                  </div>
                  <button type="button" onClick={() => void salvarAlbum(album)} disabled={salvandoId === album.id} className="rounded-md bg-[#c8b99a] px-4 py-2.5 font-body text-[0.7rem] font-semibold uppercase tracking-widest text-[#0a0a0a] transition hover:bg-[#d4c8b0] disabled:cursor-wait disabled:opacity-50">
                    {salvandoId === album.id ? 'Salvando…' : 'Salvar álbum'}
                  </button>
                </header>

                <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)] sm:p-6">
                  <div className="space-y-4">
                    <label className="block font-body text-sm text-[#d6d2cc]">
                      Título do álbum
                      <input maxLength={120} value={album.nome} onChange={event => atualizarAlbum(album.id, { nome: event.target.value })} className={inputClass} placeholder="Título exibido no site" />
                    </label>
                    <label className="block font-body text-sm text-[#d6d2cc]">
                      Descrição
                      <textarea rows={3} maxLength={500} value={album.descricao ?? ''} onChange={event => atualizarAlbum(album.id, { descricao: event.target.value })} className={inputClass} placeholder="Conte um pouco sobre este álbum" />
                    </label>
                    <label className="block font-body text-sm text-[#d6d2cc]">
                      Categoria
                      <input list="categorias-album" maxLength={80} value={album.categoria ?? ''} onChange={event => atualizarAlbum(album.id, { categoria: event.target.value })} className={inputClass} placeholder="Escolha ou digite uma categoria" />
                    </label>
                    <datalist id="categorias-album">
                      {categorias.map(categoria => <option key={categoria} value={categoria} />)}
                    </datalist>
                    <div>
                      <span className="block font-body text-sm text-[#d6d2cc]">Foto de capa</span>
                      <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b0b0b] p-2.5">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-[#171614]">
                          {capaPreview ? <Image src={capaPreview} alt="Prévia da capa atual" fill className="object-cover" unoptimized sizes="80px" /> : <span className="absolute inset-0 flex items-center justify-center text-2xl text-white/50">✧</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-[#aaa]">{capaSelecionada ? 'Capa personalizada selecionada' : 'Usando a primeira foto do álbum'}</p>
                          <button type="button" onClick={() => setAlbumSeletorCapaId(album.id)} disabled={!imagens.length} className="mt-2 rounded-md border border-[#c8b99a]/50 px-3 py-1.5 text-xs font-medium text-[#e8dfcf] transition hover:bg-[#c8b99a]/10 disabled:cursor-not-allowed disabled:opacity-40">Escolher na galeria</button>
                        </div>
                        {capaSelecionada && <button type="button" onClick={() => escolherCapa(album, null)} className="shrink-0 rounded-md px-2 py-1 text-xs text-[#aaa] hover:bg-white/5 hover:text-white" title="Voltar à primeira foto">Redefinir</button>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-body text-xs text-[#999]">Prévia do conteúdo do álbum</p>
                    {album.fotos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {album.fotos.slice(0, 9).map((item, index) => {
                          const video = isVideo(item)
                          const previewSrc = safeImageSrc(item.thumbnailUrl || (video ? '' : item.url))
                          return (
                            <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black">
                              {video ? <video src={item.url} poster={previewSrc || undefined} controls playsInline preload="none" aria-label={`Pré-visualização do vídeo ${index + 1}`} className="h-full w-full object-contain" /> : previewSrc ? <Image src={previewSrc} alt="" fill className="object-cover" unoptimized sizes="180px" /> : <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl text-white">✧</span>}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-white/10 px-4 text-center text-sm text-[#888]">Adicione fotos ou vídeos a esta subpasta no Google Drive. Uma foto pode ser escolhida como capa.</div>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {albumSeletorCapa && (
        <div role="dialog" aria-modal="true" aria-label={`Escolher capa para ${albumSeletorCapa.nome}`} className="fixed inset-0 z-[200] flex flex-col bg-black/95">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg text-[#f0ede8] sm:text-xl">Escolher foto de capa</h2>
              <p className="mt-0.5 truncate font-body text-xs text-[#aaa]">{albumSeletorCapa.nome} · {albumSeletorCapa.fotos.filter(item => !isVideo(item)).length} fotos</p>
            </div>
            <button type="button" onClick={() => setAlbumSeletorCapaId(null)} aria-label="Fechar seleção de capa" className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">Fechar <span aria-hidden="true">×</span></button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {albumSeletorCapa.fotos.filter(item => !isVideo(item)).map((item, index) => {
                const previewSrc = safeImageSrc(item.thumbnailUrl || item.url)
                const selecionada = albumSeletorCapa.capaUrl === (item.thumbnailUrl || item.url)
                return (
                  <article key={item.id} className={`overflow-hidden rounded-lg border bg-[#101010] ${selecionada ? 'border-[#c8b99a] ring-1 ring-[#c8b99a]/50' : 'border-white/10'}`}>
                    <div className="relative aspect-square bg-[#171614]">
                      {previewSrc ? <Image src={previewSrc} alt={`Opção de capa ${index + 1}`} fill loading="lazy" className="object-cover" unoptimized sizes="(max-width: 640px) 50vw, 20vw" /> : <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-4xl text-white/60">✧</span>}
                    </div>
                    <div className="p-2">
                      <button type="button" onClick={() => escolherCapa(albumSeletorCapa, item)} aria-pressed={selecionada} className={`w-full rounded-md px-2 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selecionada ? 'bg-[#c8b99a] text-[#0a0a0a]' : 'border border-white/15 text-white hover:border-[#c8b99a]/60 hover:bg-white/5'}`}>
                        {selecionada ? 'Capa atual' : 'Usar como capa'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
            {albumSeletorCapa.fotos.every(isVideo) && <p className="py-16 text-center font-body text-sm text-[#aaa]">Este álbum não tem fotos para usar como capa.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
