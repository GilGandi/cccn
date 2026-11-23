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
  const total = albuns.reduce((sum, album) => sum + album.fotos.length, 0)
  const totalVideos = albuns.reduce((sum, album) => sum + album.fotos.filter(isVideo).length, 0)
  const totalFotos = total - totalVideos
  const categorias = useMemo(() => [...new Set(albuns.map(album => album.categoria?.trim()).filter((item): item is string => Boolean(item)))], [albuns])

  const atualizarAlbum = (albumId: string, patch: Partial<Album>) => {
    setAlbuns(current => current.map(album => album.id === albumId ? { ...album, ...patch } : album))
    setAviso('')
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
                    <label className="block font-body text-sm text-[#d6d2cc]">
                      Foto de capa
                      <select value={album.capaUrl ?? ''} onChange={event => atualizarAlbum(album.id, { capaUrl: event.target.value || null })} className={inputClass}>
                        <option value="">Usar a primeira foto</option>
                        {imagens.map((item, index) => <option key={item.id} value={item.thumbnailUrl || item.url}>Foto {index + 1}</option>)}
                      </select>
                    </label>
                  </div>

                  {album.fotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {album.fotos.slice(0, 9).map((item, index) => {
                        const video = isVideo(item)
                        const previewSrc = safeImageSrc(item.thumbnailUrl || (video ? '' : item.url))
                        const selecionado = !video && album.capaUrl === (item.thumbnailUrl || item.url)
                        return video ? (
                          <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black">
                            <video src={item.url} poster={previewSrc || undefined} controls playsInline preload="none" aria-label={`Pré-visualização do vídeo ${index + 1}`} className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <button type="button" key={item.id} onClick={() => atualizarAlbum(album.id, { capaUrl: item.thumbnailUrl || item.url })} aria-label={`Usar foto ${index + 1} como capa`} aria-pressed={selecionado} className={`relative aspect-square overflow-hidden rounded-lg border bg-black ${selecionado ? 'border-[#c8b99a] ring-2 ring-[#c8b99a]/60' : 'border-white/10'}`}>
                            {previewSrc ? <Image src={previewSrc} alt="" fill className="object-cover" unoptimized sizes="180px" /> : <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl text-white">✧</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-white/10 px-4 text-center text-sm text-[#888]">Adicione fotos ou vídeos a esta subpasta no Google Drive. Uma foto pode ser escolhida como capa.</div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
