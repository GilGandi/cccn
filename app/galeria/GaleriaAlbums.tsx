'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

type GalleryMedia = {
  id: string
  url: string
  thumbnailUrl?: string
  legenda: string | null
  tipo?: 'imagem' | 'video'
}
type GalleryAlbum = { id: string; nome: string; descricao: string | null; capaUrl: string | null; categoria: string | null; fotos: GalleryMedia[] }

type ViewMode = 'grid' | 'feed'

function isVideo(item: GalleryMedia): boolean {
  return item.tipo === 'video' || /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|webm|wmv)(?:$|[?#])/i.test(item.url)
}

function downloadUrl(item: GalleryMedia, index: number): string {
  const kind = isVideo(item) ? 'video' : 'foto'
  const name = `${kind}-${String(index + 1).padStart(2, '0')}`
  return `/api/galeria-drive/download?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(name)}`
}

export default function GaleriaAlbums({ albuns }: { albuns: GalleryAlbum[] }) {
  const [albumAbertoId, setAlbumAbertoId] = useState<string | null>(null)
  const [modo, setModo] = useState<ViewMode>('grid')
  const [mediaIndex, setMediaIndex] = useState(0)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const [scrollDaGrade, setScrollDaGrade] = useState(0)
  const gradeRef = useRef<HTMLDivElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const categorias = [...new Set(albuns.map(album => album.categoria?.trim()).filter((categoria): categoria is string => Boolean(categoria)))]
  const albunsVisiveis = categoriaSelecionada ? albuns.filter(album => album.categoria?.trim() === categoriaSelecionada) : albuns
  const albumAberto = albuns.find(album => album.id === albumAbertoId) ?? null

  const fecharAlbum = useCallback(() => {
    setAlbumAbertoId(null)
    setModo('grid')
  }, [])

  const voltarParaGrade = useCallback(() => setModo('grid'), [])

  useLayoutEffect(() => {
    if (modo === 'grid' && albumAberto && gradeRef.current) gradeRef.current.scrollTop = scrollDaGrade
    if (modo === 'feed' && feedRef.current) {
      const item = feedRef.current.children.item(mediaIndex)
      item?.scrollIntoView({ block: 'start' })
    }
  }, [modo, albumAberto, scrollDaGrade, mediaIndex])

  useEffect(() => {
    if (!albumAberto) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoPressionarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (modo === 'feed') voltarParaGrade()
        else fecharAlbum()
      }
    }
    window.addEventListener('keydown', aoPressionarTecla)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', aoPressionarTecla)
    }
  }, [albumAberto, fecharAlbum, modo, voltarParaGrade])

  const abrirFeed = (index: number) => {
    setScrollDaGrade(gradeRef.current?.scrollTop ?? 0)
    setMediaIndex(index)
    setModo('feed')
  }

  return (
    <>
      {categorias.length > 0 && (
        <nav aria-label="Filtrar álbuns por categoria" className="mb-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategoriaSelecionada('')} aria-pressed={!categoriaSelecionada} className={`rounded-full border px-3 py-1.5 font-body text-xs transition-colors ${!categoriaSelecionada ? 'border-[#c8b99a] bg-[#c8b99a] text-[#0a0a0a]' : 'border-white/15 text-[#ccc] hover:border-[#c8b99a]/60'}`}>Todas</button>
          {categorias.map(categoria => <button key={categoria} type="button" onClick={() => setCategoriaSelecionada(categoria)} aria-pressed={categoriaSelecionada === categoria} className={`rounded-full border px-3 py-1.5 font-body text-xs transition-colors ${categoriaSelecionada === categoria ? 'border-[#c8b99a] bg-[#c8b99a] text-[#0a0a0a]' : 'border-white/15 text-[#ccc] hover:border-[#c8b99a]/60'}`}>{categoria}</button>)}
        </nav>
      )}
      <section aria-label="Álbuns da galeria" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albunsVisiveis.map(album => {
          const coverSrc = safeImageSrc(album.capaUrl || album.fotos.find(item => !isVideo(item))?.thumbnailUrl || album.fotos.find(item => !isVideo(item))?.url || '')
          return (
            <button
              key={album.id}
              type="button"
              onClick={() => { if (album.fotos.length) { setScrollDaGrade(0); setModo('grid'); setAlbumAbertoId(album.id) } }}
              aria-label={`Abrir álbum ${album.nome}`}
              disabled={!album.fotos.length}
              className="group overflow-hidden rounded-xl border border-white/[0.09] bg-[#101010] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c8b99a]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c8b99a] disabled:cursor-default disabled:hover:translate-y-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#171614]">
                {coverSrc ? (
                  <Image src={coverSrc} alt={`Capa do álbum ${album.nome}`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-5xl text-[#544d40]" aria-hidden="true">✧</div>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-[1.4rem] leading-snug text-[#f0ede8]">{album.nome}</h2>
                  {album.categoria && <span className="rounded-full border border-[#c8b99a]/30 px-2.5 py-1 font-body text-[0.65rem] uppercase tracking-wider text-[#c8b99a]">{album.categoria}</span>}
                </div>
                {album.descricao && <p className="mt-2 font-body text-[0.88rem] leading-relaxed text-[#aaa69f]">{album.descricao}</p>}
                <p className="mt-3 font-body text-xs text-[#888]">{album.fotos.length} {album.fotos.length === 1 ? 'item' : 'itens'}</p>
              </div>
            </button>
          )
        })}
      </section>

      {albumAberto && (
        <div role="dialog" aria-modal="true" aria-label={`Álbum ${albumAberto.nome}`} className="fixed inset-0 z-[100] flex flex-col bg-black/95">
          {modo === 'grid' ? (
            <>
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg text-[#f0ede8] sm:text-xl">{albumAberto.nome}</h2>
                  <p className="mt-0.5 font-body text-xs text-[#aaa]">{albumAberto.fotos.length} {albumAberto.fotos.length === 1 ? 'item' : 'itens'} · toque em uma imagem para abrir</p>
                </div>
                <button type="button" onClick={fecharAlbum} aria-label="Fechar álbum" className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">Fechar <span aria-hidden="true">×</span></button>
              </header>
              <div ref={gradeRef} className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-5">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                  {albumAberto.fotos.map((item, index) => {
                    const video = isVideo(item)
                    const previewSrc = safeImageSrc(item.thumbnailUrl || (video ? '' : item.url))
                    return (
                      <button key={item.id} type="button" onClick={() => abrirFeed(index)} aria-label={`Abrir ${video ? 'vídeo' : 'foto'} ${index + 1}`} className="group relative aspect-square overflow-hidden rounded-md bg-[#171614] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a] sm:rounded-lg">
                        {previewSrc && <Image src={previewSrc} alt="" fill loading="lazy" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />}
                        {video && <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/15 text-4xl text-white drop-shadow">▶</span>}
                        {!previewSrc && <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-4xl text-white">{video ? '▶' : '✧'}</span>}
                      </button>
                    )
                  })}
                </div>
                {albumAberto.fotos.length === 0 && <p className="py-16 text-center font-body text-sm text-[#aaa]">Este álbum ainda não tem fotos ou vídeos.</p>}
              </div>
            </>
          ) : (
            <>
              <div className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
                <button type="button" onClick={voltarParaGrade} className="rounded-full border border-white/25 bg-black/60 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">‹ <span className="ml-1">Voltar à galeria</span></button>
                <p className="truncate px-3 text-center font-body text-xs text-white/70">{albumAberto.nome}</p>
                <span className="w-[125px]" aria-hidden="true" />
              </div>
              <div ref={feedRef} className="relative min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain bg-black" style={{ scrollBehavior: 'smooth' }}>
                {albumAberto.fotos.map((item, index) => {
                  const video = isVideo(item)
                  const poster = safeImageSrc(item.thumbnailUrl || '') || undefined
                  return (
                    <article key={item.id} className="relative flex h-full min-h-full w-full snap-start items-center justify-center bg-black">
                      {video ? (
                        <video src={item.url} poster={poster} controls playsInline preload="none" className="h-full w-full object-contain" aria-label={`Vídeo ${index + 1} do álbum ${albumAberto.nome}`} />
                      ) : (
                        <div className="absolute inset-0">
                          {safeImageSrc(item.url) && <Image src={safeImageSrc(item.url)!} alt={`Foto ${index + 1} do álbum ${albumAberto.nome}`} fill loading={Math.abs(index - mediaIndex) <= 1 ? 'eager' : 'lazy'} className="object-contain" unoptimized sizes="100vw" />}
                        </div>
                      )}
                      <a href={downloadUrl(item, index)} aria-label={`Baixar ${video ? 'vídeo' : 'foto'} ${index + 1}`} className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#c8b99a] text-xl font-semibold text-[#0a0a0a] shadow-lg transition hover:bg-[#d4c8b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" title="Baixar">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </a>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
