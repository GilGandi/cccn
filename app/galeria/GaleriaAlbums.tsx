'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

type GalleryPhoto = { id: string; url: string; legenda: string | null }
type GalleryAlbum = { id: string; nome: string; descricao: string | null; capaUrl: string | null; categoria: string | null; fotos: GalleryPhoto[] }

/** Converte links de imagem do Drive em URLs de prévia menores, mantendo o link original no download. */
function getPreviewUrl(source: string, width = 640): string {
  const safeSource = safeImageSrc(source)
  if (!safeSource) return ''

  try {
    const url = new URL(safeSource)
    const host = url.hostname.toLowerCase()

    if (host === 'drive.google.com' && url.pathname === '/thumbnail') {
      url.searchParams.set('sz', `w${width}`)
      return url.toString()
    }

    if (host === 'drive.google.com' && url.pathname === '/uc') {
      const id = url.searchParams.get('id')
      if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${width}`
    }

    if (host.endsWith('googleusercontent.com')) {
      const current = url.toString()
      if (/=(?:s|w)\d+(?:-h\d+)?(?:-c)?$/.test(current)) {
        return current.replace(/=(?:s|w)\d+(?:-h\d+)?(?:-c)?$/, `=w${width}-h${width}`)
      }
      return `${current}=w${width}-h${width}`
    }
  } catch {
    return safeSource
  }

  return safeSource
}

function downloadHref(photo: GalleryPhoto, album: GalleryAlbum, index: number) {
  const name = photo.legenda || `${album.nome}-${index + 1}`
  return `/api/galeria-drive/download?id=${encodeURIComponent(photo.id)}&name=${encodeURIComponent(name)}`
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 16v4h14v-4" />
    </svg>
  )
}

export default function GaleriaAlbums({ albuns }: { albuns: GalleryAlbum[] }) {
  const [albumAbertoId, setAlbumAbertoId] = useState<string | null>(null)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const categorias = [...new Set(albuns.map(album => album.categoria?.trim()).filter((categoria): categoria is string => Boolean(categoria)))]
  const albunsVisiveis = categoriaSelecionada ? albuns.filter(album => album.categoria?.trim() === categoriaSelecionada) : albuns
  const albumAberto = albuns.find(album => album.id === albumAbertoId) ?? null

  useEffect(() => {
    if (!albumAberto) return
    const overflowAnterior = document.body.style.overflow
    const estadoAnterior = window.history.state
    const marcaHistorico = `galeria-album-${albumAberto.id}`
    document.body.style.overflow = 'hidden'
    window.history.pushState({ ...(estadoAnterior ?? {}), galeriaAlbum: marcaHistorico }, '')

    const aoPressionarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAlbumAbertoId(null)
    }
    const aoVoltar = () => setAlbumAbertoId(null)
    window.addEventListener('keydown', aoPressionarTecla)
    window.addEventListener('popstate', aoVoltar)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', aoPressionarTecla)
      window.removeEventListener('popstate', aoVoltar)
      if (window.history.state?.galeriaAlbum === marcaHistorico) window.history.back()
    }
  }, [albumAberto])

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
          const coverSrc = getPreviewUrl(album.capaUrl || album.fotos[0]?.url || '', 640)
          return (
            <button
              key={album.id}
              type="button"
              onClick={() => { if (album.fotos.length) setAlbumAbertoId(album.id) }}
              aria-label={`Abrir álbum ${album.nome}`}
              disabled={!album.fotos.length}
              className="group overflow-hidden rounded-xl border border-white/[0.09] bg-[#101010] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c8b99a]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c8b99a] disabled:cursor-default disabled:hover:translate-y-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#171614]">
                {coverSrc ? (
                  <Image src={coverSrc} alt={`Capa do álbum ${album.nome}`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" unoptimized loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
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
                <p className="mt-3 font-body text-xs text-[#8f8b84]">{album.fotos.length} foto{album.fotos.length !== 1 ? 's' : ''}</p>
              </div>
            </button>
          )
        })}
      </section>

      {albumAberto && (
        <>
          {/* Desktop/tablet: mosaico com várias fotos visíveis e download individual. */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Álbum ${albumAberto.nome}`}
            className="fixed inset-0 z-[100] hidden items-center justify-center bg-black/95 p-4 md:flex sm:p-6"
          >
            <div className="flex max-h-[94dvh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl">
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg text-[#f0ede8] sm:text-xl">{albumAberto.nome}</h2>
                  <p className="mt-0.5 font-body text-xs text-[#aaa]">{albumAberto.fotos.length} foto{albumAberto.fotos.length !== 1 ? 's' : ''}</p>
                </div>
                <button type="button" onClick={() => setAlbumAbertoId(null)} aria-label="Fechar álbum" className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">Fechar <span aria-hidden="true">×</span></button>
              </header>

              <div className="overflow-y-auto overscroll-contain p-3 sm:p-5">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {albumAberto.fotos.map((foto, index) => {
                    const src = getPreviewUrl(foto.url, 640)
                    return (
                      <article key={foto.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#171717]">
                        <div className="relative aspect-[4/3] bg-black">
                          {src && <Image src={src} alt={foto.legenda || `Foto ${index + 1} do álbum ${albumAberto.nome}`} fill className="object-cover" unoptimized loading="lazy" sizes="(max-width: 1024px) 50vw, 25vw" />}
                        </div>
                        <div className="flex min-h-12 items-center justify-between gap-2 px-3 py-2">
                          <span className="truncate font-body text-xs text-[#aaa]">{foto.legenda || `Foto ${index + 1}`}</span>
                          <a href={downloadHref(foto, albumAberto, index)} aria-label={`Baixar foto ${index + 1}`} className="shrink-0 rounded-full bg-[#c8b99a] px-3 py-1.5 font-body text-xs font-medium text-[#0a0a0a] transition-colors hover:bg-[#d4c8b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">Baixar</a>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Celular: feed vertical em tela cheia, com somente o controle de baixar sobre a foto. */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Feed do álbum ${albumAberto.nome}`}
            className="fixed inset-0 z-[100] bg-black md:hidden"
          >
            <div className="h-[100dvh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain">
              {albumAberto.fotos.map((foto, index) => {
                const src = getPreviewUrl(foto.url, 960)
                return (
                  <section key={foto.id} aria-label={`Foto ${index + 1} de ${albumAberto.fotos.length}`} className="relative flex h-[100dvh] w-full snap-start items-center justify-center bg-black">
                    {src && <Image src={src} alt={foto.legenda || `Foto ${index + 1} do álbum ${albumAberto.nome}`} fill className="object-contain" unoptimized loading={index < 2 ? 'eager' : 'lazy'} sizes="100vw" />}
                    <a
                      href={downloadHref(foto, albumAberto, index)}
                      aria-label={`Baixar foto ${index + 1}`}
                      className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-full bg-black/65 p-3 text-white shadow-lg ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]"
                    >
                      <DownloadIcon />
                      <span className="text-[0.62rem] font-medium">Baixar</span>
                    </a>
                  </section>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
