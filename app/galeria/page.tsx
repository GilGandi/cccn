export const revalidate = 0

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import GaleriaAlbums from './GaleriaAlbums'
import { prisma } from '@/lib/prisma'

type GalleryPhoto = { id: string; url: string; legenda: string | null }
type GalleryAlbum = { id: string; nome: string; descricao: string | null; capaUrl: string | null; fotos: GalleryPhoto[] }

export default async function Galeria() {
  const [albuns, semAlbum] = await Promise.all([
    prisma.galeriaCategoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { fotos: { orderBy: { createdAt: 'desc' }, take: 200 } },
    }).catch(() => []),
    prisma.foto.findMany({ where: { categoriaId: null }, orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => []),
  ])

  const publicAlbums: GalleryAlbum[] = [
    ...albuns.filter(album => album.fotos.length > 0).map(album => ({
      id: album.id,
      nome: album.nome,
      descricao: album.descricao,
      capaUrl: album.capaUrl,
      fotos: album.fotos.map(foto => ({ id: foto.id, url: foto.url, legenda: foto.legenda })),
    })),
    ...(semAlbum.length ? [{
      id: 'sem-album',
      nome: 'Geral',
      descricao: null,
      capaUrl: null,
      fotos: semAlbum.map(foto => ({ id: foto.id, url: foto.url, legenda: foto.legenda })),
    }] : []),
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
          <GaleriaAlbums albuns={publicAlbums} />
        )}
      </div>
      <Footer />
    </main>
  )
}
