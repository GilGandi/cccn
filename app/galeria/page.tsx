export const revalidate = 0

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import { prisma } from '@/lib/prisma'
import { safeImageSrc } from '@/lib/safeUrl'

export default async function Galeria() {
  const [albuns, semAlbum] = await Promise.all([
    prisma.galeriaCategoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { fotos: { orderBy: { createdAt: 'desc' }, take: 200 } },
    }).catch(() => []),
    prisma.foto.findMany({ where: { categoriaId: null }, orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => []),
  ])

  const publicAlbums = [
    ...albuns.filter(album => album.fotos.length > 0).map(album => ({ ...album, fotos: album.fotos, cover: album.capaUrl })),
    ...(semAlbum.length ? [{ id: 'sem-album', nome: 'Sem álbum', descricao: null, fotos: semAlbum, cover: null }] : []),
  ]
  const totalFotos = publicAlbums.reduce((total, album) => total + album.fotos.length, 0)

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <section className="relative mx-auto max-w-[1400px] overflow-hidden border-b border-white/[0.12] px-6 pb-14 pt-36 sm:px-10 lg:px-16 lg:pt-40">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="mb-4 block font-body text-[0.68rem] tracking-[0.25em] uppercase text-[#c8b99a]">Memórias</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>Nossa <em className="text-[#c8b99a]">galeria</em></h1>
          <p className="mt-3 font-body text-[0.9rem] text-[#aaa]">{totalFotos} foto{totalFotos !== 1 ? 's' : ''} em {publicAlbums.length} álbum{publicAlbums.length !== 1 ? 's' : ''}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        {totalFotos === 0 ? (
          <p className="py-20 text-center font-body text-[0.98rem] text-[#aaa]">Nenhuma foto disponível no momento.</p>
        ) : (
          <div className="space-y-14">
            {publicAlbums.map(album => {
              const coverPhoto = album.cover ? album.fotos.find(foto => foto.url === album.cover) : undefined
              const coverSrc = safeImageSrc(album.cover || coverPhoto?.url || album.fotos[0]?.url || '')
              return (
                <section key={album.id} aria-labelledby={`album-${album.id}`}>
                  <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 id={`album-${album.id}`} className="font-display text-[1.55rem] text-[#f0ede8]">{album.nome}</h2>
                      {album.descricao && <p className="mt-1 max-w-2xl font-body text-[0.9rem] leading-relaxed text-[#b4b0a9]">{album.descricao}</p>}
                    </div>
                    <span className="font-body text-[0.8rem] text-[#aaa]">{album.fotos.length} foto{album.fotos.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {coverSrc && (
                      <div className="group relative col-span-2 aspect-[2/1] overflow-hidden rounded-xl border border-white/[0.08] bg-[#111] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[300px]">
                        <Image src={coverSrc} alt={`Capa do álbum ${album.nome}`} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 40vw" />
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white">Capa do álbum</span>
                      </div>
                    )}
                    {album.fotos.filter(foto => foto.url !== album.cover).map((foto: any) => {
                      const src = safeImageSrc(foto.url)
                      if (!src) return null
                      return (
                        <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-[#111]">
                          <Image src={src} alt={foto.legenda || `Foto do álbum ${album.nome}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                          {foto.legenda && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8"><p className="font-body text-[0.8rem] leading-snug text-white">{foto.legenda}</p></div>}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
