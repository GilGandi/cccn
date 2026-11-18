export const revalidate = 0

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import GaleriaAlbums from './GaleriaAlbums'
import { prisma } from '@/lib/prisma'

export default async function Galeria() {
  const [categorias, semAlbum] = await Promise.all([
    prisma.galeriaCategoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { fotos: { orderBy: { createdAt: 'desc' }, take: 200 } },
    }).catch(() => []),
    prisma.foto.findMany({ where: { categoriaId: null }, orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => []),
  ])

  const albuns = [
    ...categorias.filter(album => album.fotos.length > 0).map(album => ({
      id: album.id,
      nome: album.nome,
      descricao: album.descricao,
      capaUrl: album.capaUrl,
      fotos: album.fotos.map(foto => ({ id: foto.id, url: foto.url, legenda: foto.legenda })),
    })),
    ...(semAlbum.length > 0 ? [{
      id: 'sem-album',
      nome: 'Geral',
      descricao: null,
      capaUrl: null,
      fotos: semAlbum.map(foto => ({ id: foto.id, url: foto.url, legenda: foto.legenda })),
    }] : []),
  ]
  const totalFotos = albuns.reduce((total, album) => total + album.fotos.length, 0)

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }} className="relative mx-auto max-w-[1200px] overflow-hidden px-6 pb-16 pt-40 sm:px-10 lg:px-16">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="mb-4 block font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a]">Memórias</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>Nossa <em style={{ color: '#c8b99a' }}>galeria</em></h1>
          {totalFotos > 0 && <p className="mt-3 font-body text-[0.78rem] text-[#777]">{albuns.length} álbum{albuns.length === 1 ? '' : 's'} · {totalFotos} foto{totalFotos === 1 ? '' : 's'}</p>}
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:px-16">
        {totalFotos === 0 ? <p className="py-20 text-center font-body text-[0.95rem] text-[#888480]">Nenhuma foto disponível no momento.</p> : <GaleriaAlbums albuns={albuns} />}
      </div>
      <Footer />
    </main>
  )
}
