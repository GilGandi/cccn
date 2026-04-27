export const revalidate = 0

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import { prisma } from '@/lib/prisma'
import { safeImageSrc } from '@/lib/safeUrl'

export default async function Galeria() {
  const [categorias, semCategoria] = await Promise.all([
    prisma.galeriaCategoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { fotos: { orderBy: { createdAt: 'desc' }, take: 200 } },
    }).catch(() => []),
    prisma.foto.findMany({
      where: { categoriaId: null },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }).catch(() => []),
  ])

  const todasAsCategorias = [
    ...categorias,
    ...(semCategoria.length > 0 ? [{ id: 'sem-categoria', nome: 'Geral', fotos: semCategoria, ordem: 999 }] : []),
  ]

  const totalFotos = todasAsCategorias.reduce((acc, c) => acc + c.fotos.length, 0)

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />

      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}
        className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Memórias</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Nossa <em style={{ color: '#c8b99a' }}>galeria</em>
          </h1>
          {totalFotos > 0 && (
            <p className="font-body text-[0.78rem] text-[#555] mt-3">{totalFotos} foto{totalFotos !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        {totalFotos === 0 ? (
          <p className="font-body text-[0.95rem] text-[#888480] text-center py-20">Nenhuma foto disponível no momento.</p>
        ) : (
          <div className="flex flex-col gap-16">
            {todasAsCategorias.filter(c => c.fotos.length > 0).map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-display text-[1.4rem] text-[#f0ede8]">{cat.nome}</h2>
                  <span className="font-body text-[0.65rem] text-[#555]">{cat.fotos.length} foto{cat.fotos.length !== 1 ? 's' : ''}</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {cat.fotos.map((foto: any) => {
                    const src = safeImageSrc(foto.url)
                    if (!src) return null
                    return (
                      <div key={foto.id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/[0.04]">
                        <Image src={src} alt={foto.legenda || 'Foto'} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                        {foto.legenda && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="font-body text-[0.72rem] text-[#f0ede8] leading-snug">{foto.legenda}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
