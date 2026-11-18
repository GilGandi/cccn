'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

type GalleryPhoto = { id: string; url: string; legenda: string | null }
type GalleryAlbum = { id: string; nome: string; descricao: string | null; capaUrl: string | null; fotos: GalleryPhoto[] }

export default function GaleriaAlbums({ albuns }: { albuns: GalleryAlbum[] }) {
  const [albumAbertoId, setAlbumAbertoId] = useState<string | null>(null)
  const [fotoIndex, setFotoIndex] = useState(0)
  const albumAberto = albuns.find(album => album.id === albumAbertoId) ?? null
  const fotoAberta = albumAberto?.fotos[fotoIndex] ?? null

  const fecharAlbum = useCallback(() => setAlbumAbertoId(null), [])
  const navegar = useCallback((direcao: -1 | 1) => {
    if (!albumAberto) return
    setFotoIndex(indice => (indice + direcao + albumAberto.fotos.length) % albumAberto.fotos.length)
  }, [albumAberto])

  useEffect(() => {
    if (!albumAberto) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoPressionarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') fecharAlbum()
      if (event.key === 'ArrowLeft' && albumAberto.fotos.length > 1) navegar(-1)
      if (event.key === 'ArrowRight' && albumAberto.fotos.length > 1) navegar(1)
    }
    window.addEventListener('keydown', aoPressionarTecla)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', aoPressionarTecla)
    }
  }, [albumAberto, fecharAlbum, navegar])

  return (
    <>
      <section aria-label="Álbuns da galeria" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albuns.map(album => {
          const coverSrc = safeImageSrc(album.capaUrl || album.fotos[0]?.url || '')
          return (
            <button
              key={album.id}
              type="button"
              onClick={() => { setFotoIndex(0); setAlbumAbertoId(album.id) }}
              aria-label={`Abrir álbum ${album.nome}`}
              className="group overflow-hidden rounded-xl border border-white/[0.09] bg-[#101010] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c8b99a]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c8b99a]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#171614]">
                {coverSrc ? (
                  <Image src={coverSrc} alt={`Capa do álbum ${album.nome}`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-5xl text-[#544d40]" aria-hidden="true">✧</div>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h2 className="font-display text-[1.4rem] leading-snug text-[#f0ede8]">{album.nome}</h2>
                {album.descricao && <p className="mt-2 font-body text-[0.88rem] leading-relaxed text-[#aaa69f]">{album.descricao}</p>}
              </div>
            </button>
          )
        })}
      </section>

      {albumAberto && fotoAberta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Álbum ${albumAberto.nome}`}
          onClick={event => { if (event.target === event.currentTarget) fecharAlbum() }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6"
        >
          <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg text-[#f0ede8] sm:text-xl">{albumAberto.nome}</h2>
                <p className="mt-0.5 font-body text-xs text-[#aaa]">{fotoIndex + 1} de {albumAberto.fotos.length}</p>
              </div>
              <button type="button" onClick={fecharAlbum} aria-label="Fechar álbum" className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">Fechar <span aria-hidden="true">×</span></button>
            </header>

            <div className="relative flex shrink-0 items-center justify-center bg-black px-12 py-3 sm:px-16">
              <div className="relative h-[65vh] w-full max-w-5xl sm:h-[72vh]">
                {safeImageSrc(fotoAberta.url) && <Image src={safeImageSrc(fotoAberta.url)!} alt={fotoAberta.legenda || `Foto ${fotoIndex + 1} do álbum ${albumAberto.nome}`} fill className="object-contain" unoptimized sizes="(max-width: 768px) 90vw, 80vw" />}
              </div>

              {albumAberto.fotos.length > 1 && (
                <>
                  <button type="button" onClick={() => navegar(-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-2xl text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a] sm:left-4 sm:h-12 sm:w-12">‹</button>
                  <button type="button" onClick={() => navegar(1)} aria-label="Próxima foto" className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-2xl text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a] sm:right-4 sm:h-12 sm:w-12">›</button>
                </>
              )}
            </div>

            {fotoAberta.legenda && <p className="border-t border-white/10 px-4 py-3 text-center font-body text-sm leading-relaxed text-[#ddd] sm:px-6">{fotoAberta.legenda}</p>}
          </div>
        </div>
      )}
    </>
  )
}
