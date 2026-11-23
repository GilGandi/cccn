'use client'

import { useCallback, useEffect, useState } from 'react'
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

function isVideo(item: GalleryMedia): boolean {
  return item.tipo === 'video' || /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|webm|wmv)(?:$|[?#])/i.test(item.url)
}

function downloadUrl(item: GalleryMedia, index: number): string {
  const kind = isVideo(item) ? 'video' : 'foto'
  const name = `${kind}-${String(index + 1).padStart(2, '0')}`
  return `/api/galeria-drive/download?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(name)}`
}

function publicDriveUrl(item: GalleryMedia): string {
  return `https://drive.google.com/open?id=${encodeURIComponent(item.id)}`
}

export default function GaleriaAlbums({ albuns }: { albuns: GalleryAlbum[] }) {
  const [albumAbertoId, setAlbumAbertoId] = useState<string | null>(null)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const [mensagemCompartilhamento, setMensagemCompartilhamento] = useState('')
  const [compartilhandoId, setCompartilhandoId] = useState('')
  const categorias = [...new Set(albuns.map(album => album.categoria?.trim()).filter((categoria): categoria is string => Boolean(categoria)))]
  const albunsVisiveis = categoriaSelecionada ? albuns.filter(album => album.categoria?.trim() === categoriaSelecionada) : albuns
  const albumAberto = albuns.find(album => album.id === albumAbertoId) ?? null

  const fecharAlbum = useCallback(() => setAlbumAbertoId(null), [])

  useEffect(() => {
    if (!albumAberto) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoPressionarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') fecharAlbum()
    }
    window.addEventListener('keydown', aoPressionarTecla)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', aoPressionarTecla)
    }
  }, [albumAberto, fecharAlbum])

  const compartilharInstagram = async (item: GalleryMedia, index: number) => {
    setMensagemCompartilhamento('')
    const nome = `${isVideo(item) ? 'video' : 'foto'}-${String(index + 1).padStart(2, '0')}`
    const fallbackInstagram = () => {
      const link = document.createElement('a')
      link.href = downloadUrl(item, index)
      link.download = nome
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
      setMensagemCompartilhamento('O arquivo foi baixado. Anexe-o no Instagram para publicar ou enviar.')
    }

    if (!navigator.share || !navigator.canShare) {
      fallbackInstagram()
      return
    }

    setCompartilhandoId(item.id)
    try {
      const response = await fetch(downloadUrl(item, index))
      if (!response.ok) throw new Error('download')
      const blob = await response.blob()
      const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || (isVideo(item) ? 'mp4' : 'jpg')
      const file = new File([blob], `${nome}.${extension}`, { type: blob.type || (isVideo(item) ? 'video/mp4' : 'image/jpeg') })
      const shareData = { files: [file], title: `Compartilhar ${isVideo(item) ? 'vídeo' : 'foto'}` }
      if (!navigator.canShare({ files: [file] })) {
        fallbackInstagram()
        return
      }
      await navigator.share(shareData)
      setMensagemCompartilhamento('Compartilhamento aberto. Escolha Instagram na lista de aplicativos.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      fallbackInstagram()
    } finally {
      setCompartilhandoId('')
    }
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
              onClick={() => { if (album.fotos.length) { setMensagemCompartilhamento(''); setAlbumAbertoId(album.id) } }}
              aria-label={`Abrir álbum ${album.nome}`}
              disabled={!album.fotos.length}
              className="group overflow-hidden rounded-xl border border-white/[0.09] bg-[#101010] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c8b99a]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c8b99a] disabled:cursor-default disabled:hover:translate-y-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#171614]">
                {coverSrc ? <Image src={coverSrc} alt={`Capa do álbum ${album.nome}`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" /> : <div className="flex h-full items-center justify-center font-display text-5xl text-[#544d40]" aria-hidden="true">✧</div>}
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
        <div role="dialog" aria-modal="true" aria-label={`Galeria ${albumAberto.nome}`} className="fixed inset-0 z-[100] flex flex-col bg-black/95">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg text-[#f0ede8] sm:text-xl">{albumAberto.nome}</h2>
              <p className="mt-0.5 font-body text-xs text-[#aaa]">{albumAberto.fotos.length} {albumAberto.fotos.length === 1 ? 'item' : 'itens'}</p>
            </div>
            <button type="button" onClick={fecharAlbum} aria-label="Fechar galeria" className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8b99a]">Fechar <span aria-hidden="true">×</span></button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {albumAberto.fotos.map((item, index) => {
                const video = isVideo(item)
                const previewSrc = safeImageSrc(item.thumbnailUrl || (video ? '' : item.url))
                return (
                  <article key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#101010]">
                    <div className="relative aspect-[4/3] bg-[#171614]">
                      {video ? (
                        <video src={item.url} poster={previewSrc || undefined} controls playsInline preload="metadata" aria-label={`Vídeo ${index + 1}`} className="absolute inset-0 h-full w-full object-contain" />
                      ) : previewSrc ? (
                        <Image src={previewSrc} alt={`Foto ${index + 1}`} fill loading="lazy" className="object-contain" unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-4xl text-white">✧</div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 sm:p-3">
                      <a href={downloadUrl(item, index)} download aria-label={`Baixar ${video ? 'vídeo' : 'foto'} ${index + 1}`} className="flex min-h-10 items-center justify-center gap-1 rounded-md bg-[#c8b99a] px-1.5 py-2 text-[0.68rem] font-semibold text-[#0a0a0a] transition hover:bg-[#d4c8b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:gap-2 sm:px-2 sm:text-xs" title="Baixar">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Baixar</span>
                      </a>
                      <button type="button" onClick={() => void compartilharInstagram(item, index)} disabled={compartilhandoId === item.id} aria-label={`Compartilhar ${video ? 'vídeo' : 'foto'} ${index + 1} no Instagram`} className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-white/15 px-1.5 py-2 text-[0.68rem] font-medium text-white transition hover:border-[#c8b99a]/60 hover:bg-white/5 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8b99a] sm:gap-2 sm:px-2 sm:text-xs" title="Compartilhar no Instagram">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg><span>{compartilhandoId === item.id ? 'Preparando…' : 'Instagram'}</span>
                      </button>
                      <a href={`https://wa.me/?text=${encodeURIComponent(`${video ? 'Vídeo' : 'Foto'} do álbum ${albumAberto.nome}: ${publicDriveUrl(item)}`)}`} target="_blank" rel="noreferrer" aria-label={`Enviar ${video ? 'vídeo' : 'foto'} ${index + 1} pelo WhatsApp`} className="flex min-h-10 items-center justify-center gap-1 rounded-md border border-white/15 px-1.5 py-2 text-[0.68rem] font-medium text-white transition hover:border-[#c8b99a]/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8b99a] sm:gap-2 sm:px-2 sm:text-xs" title="Enviar pelo WhatsApp">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l.9-4.7a8.5 8.5 0 1 1 16.6-3.6Z"/><path d="M8.5 8.3c.3-.7.6-.7 1-.7h.4c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4 0 .7.5.8 1.2 1.5 2 2 .2.1.5.2.7 0l.8-1c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.1-.7 1.5-.5.4-1.2.7-2 .6-1.2-.2-2.7-.9-4.1-2.2-1.2-1.1-2-2.5-2.2-3.4-.2-.8.1-1.5.5-2Z"/></svg><span>WhatsApp</span>
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
            {albumAberto.fotos.length === 0 && <p className="py-16 text-center font-body text-sm text-[#aaa]">Este álbum ainda não tem fotos ou vídeos.</p>}
            <p className="sr-only" role="status" aria-live="polite">{mensagemCompartilhamento}</p>
          </div>
        </div>
      )}
    </>
  )
}
