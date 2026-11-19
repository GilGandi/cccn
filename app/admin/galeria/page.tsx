'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

type Foto = { id: string; url: string; legenda: string | null }
type Album = { id: string; nome: string; fotos: Foto[] }
type GalleryResponse = { albuns?: Album[]; nomePasta?: string; error?: string }

export default function AdminGaleria() {
  const [albuns, setAlbuns] = useState<Album[]>([])
  const [nomePasta, setNomePasta] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const response = await fetch('/api/galeria-drive', { cache: 'no-store' })
      const data = await response.json() as GalleryResponse
      if (!response.ok) throw new Error(data.error || 'Não foi possível acessar a pasta do Google Drive.')
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.9rem] leading-tight text-[#f0ede8]">Galeria</h1>
          <p className="mt-1 font-body text-[0.9rem] text-[#aaa]">{total} foto{total === 1 ? '' : 's'} · {albuns.length} álbum{albuns.length === 1 ? '' : 's'}{nomePasta ? ` · ${nomePasta}` : ''}</p>
        </div>
        <button type="button" onClick={() => void carregar()} disabled={loading} className="rounded-md bg-[#c8b99a] px-4 py-2.5 font-body text-[0.72rem] font-semibold uppercase tracking-widest text-[#0a0a0a] transition-all hover:bg-[#d4c8b0] disabled:opacity-50">
          {loading ? 'Atualizando…' : 'Atualizar'}
        </button>
      </header>

      <aside className="rounded-xl border border-white/[0.1] bg-[#111] p-4 text-[0.88rem] leading-relaxed text-[#b4b0a9] sm:p-5">
        As imagens e os álbuns são sincronizados da pasta do Google Drive. Para adicionar, remover ou organizar fotos, faça a alteração no Drive; cada subpasta é exibida como um álbum.
      </aside>

      {erro && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{erro}</p>}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c8b99a]/30 border-t-[#c8b99a]" aria-label="Carregando galeria" /></div>
      ) : total === 0 && !erro ? (
        <p className="rounded-xl border border-dashed border-white/[0.14] px-5 py-16 text-center font-body text-[0.95rem] text-[#aaa]">A pasta configurada não contém imagens visíveis.</p>
      ) : (
        <div className="space-y-8">
          {albuns.map(album => (
            <section key={album.id} aria-label={`Álbum ${album.nome}`}>
              <h2 className="mb-3 font-display text-xl text-[#f0ede8]">{album.nome} <span className="font-body text-sm text-[#888]">({album.fotos.length})</span></h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
                {album.fotos.map(foto => {
                  const src = safeImageSrc(foto.url)
                  return src ? (
                    <div key={foto.id} className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-[#111]">
                      <Image src={src} alt={foto.legenda || `Foto do álbum ${album.nome}`} fill className="object-cover" unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                    </div>
                  ) : null
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
