'use client'

import { useState } from 'react'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

type GalleryPhoto = { id: string; url: string; legenda: string | null }
type GalleryAlbum = { id: string; nome: string; descricao: string | null; capaUrl: string | null; fotos: GalleryPhoto[] }

export default function GaleriaAlbums({ albuns }: { albuns: GalleryAlbum[] }) {
  const [albumAtual, setAlbumAtual] = useState<GalleryAlbum | null>(null)
  const [fotoAberta, setFotoAberta] = useState<GalleryPhoto | null>(null)

  if (albumAtual) {
    return <section aria-label={`Fotos do álbum ${albumAtual.nome}`}>
      <button onClick={() => { setFotoAberta(null); setAlbumAtual(null) }} className="mb-8 inline-flex items-center gap-2 font-body text-[0.72rem] tracking-widest uppercase text-[#c8b99a] hover:text-[#f0ede8] transition-colors">
        <span aria-hidden="true">←</span> Todos os álbuns
      </button>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] text-[#f0ede8]">{albumAtual.nome}</h2>
          <span className="font-body text-[0.65rem] text-[#777]">{albumAtual.fotos.length} foto{albumAtual.fotos.length === 1 ? '' : 's'}</span>
        </div>
        {albumAtual.descricao && <p className="max-w-2xl font-body text-[0.88rem] leading-relaxed text-[#999]">{albumAtual.descricao}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {albumAtual.fotos.map(foto => {
          const src = safeImageSrc(foto.url)
          if (!src) return null
          return <button key={foto.id} type="button" onClick={() => setFotoAberta(foto)} aria-label={`Ampliar foto${foto.legenda ? `: ${foto.legenda}` : ''}`} className="group relative aspect-square overflow-hidden rounded-lg border border-white/[0.05] bg-[#111] text-left">
            <Image src={src} alt={foto.legenda || `Foto do álbum ${albumAtual.nome}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
            {foto.legenda && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 font-body text-left text-[0.72rem] text-[#f0ede8] opacity-0 transition-opacity group-hover:opacity-100">{foto.legenda}</span>}
          </button>
        })}
      </div>
      {fotoAberta && <div role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setFotoAberta(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8">
        <button type="button" aria-label="Fechar foto" onClick={() => setFotoAberta(null)} className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-black/50 px-4 py-2 font-body text-sm text-white hover:bg-white/10">Fechar ✕</button>
        <div className="relative h-[78vh] w-full max-w-6xl" onClick={event => event.stopPropagation()}>
          {safeImageSrc(fotoAberta.url) && <Image src={safeImageSrc(fotoAberta.url)!} alt={fotoAberta.legenda || `Foto do álbum ${albumAtual.nome}`} fill className="object-contain" unoptimized />}
          {fotoAberta.legenda && <p className="absolute -bottom-8 left-0 right-0 text-center font-body text-sm text-white">{fotoAberta.legenda}</p>}
        </div>
      </div>}
    </section>
  }

  return <section aria-label="Álbuns da galeria">
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {albuns.map(album => {
        const cover = safeImageSrc(album.capaUrl || album.fotos[0]?.url || '')
        return <button key={album.id} type="button" onClick={() => setAlbumAtual(album)} className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#101010] text-left transition-all hover:-translate-y-1 hover:border-[#c8b99a]/40">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#181818]">
            {cover ? <Image src={cover} alt={`Capa do álbum ${album.nome}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized /> : <div className="flex h-full items-center justify-center font-display text-4xl text-[#39352e]">✧</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-5 font-body text-[0.65rem] tracking-widest uppercase text-[#e2d3b5]">{album.fotos.length} foto{album.fotos.length === 1 ? '' : 's'}</span>
          </div>
          <div className="p-5">
            <h2 className="font-display text-[1.35rem] text-[#f0ede8]">{album.nome}</h2>
            {album.descricao && <p className="mt-2 line-clamp-2 font-body text-[0.78rem] leading-relaxed text-[#777]">{album.descricao}</p>}
            <span className="mt-4 inline-flex items-center gap-2 font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#c8b99a]">Abrir álbum <span aria-hidden="true">→</span></span>
          </div>
        </button>
      })}
    </div>
  </section>
}
