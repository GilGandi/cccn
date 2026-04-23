export const revalidate = 600
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import { getConfigs } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

export default async function Historia() {
  const [cfg, lideres] = await Promise.all([
    getConfigs(),
    prisma.lider.findMany({ where: { ativo: true }, orderBy: { ordem: 'asc' } }),
  ])

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[900px] mx-auto" style={{ borderBottom: lideres.length > 0 ? '1px solid rgba(240,237,232,0.12)' : 'none' }}>
        <WoodCross opacity={0.035} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Nossa História</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8] mb-10" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            {cfg.historia_titulo.split(' do ')[0]}<br /><em style={{ color: '#c8b99a' }}>do {cfg.historia_titulo.split(' do ').slice(1).join(' do ')}</em>
          </h1>
          <div className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480] flex flex-col gap-6 max-w-[660px]">
            {[cfg.historia_p1, cfg.historia_p2, cfg.historia_p3].filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Liderança */}
      {lideres.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Liderança</span>
          <h2 className="font-display font-normal leading-[1.2] text-[#f0ede8] mb-12" style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)' }}>
            Quem conduz <em style={{ color: '#c8b99a' }}>nossa comunidade</em>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {lideres.map(l => (
              <div key={l.id} className="flex flex-col gap-4">
                <div className="relative h-64 rounded-xl overflow-hidden bg-[#111] border border-white/[0.06]">
                  {l.fotoUrl ? (
                    <Image src={l.fotoUrl} alt={l.nome} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[2.5rem]">
                        {l.nome.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-display text-[1.15rem] text-[#f0ede8]">{l.nome}</div>
                  <div className="font-body text-[0.65rem] tracking-widest uppercase text-[#c8b99a] mt-0.5 mb-2">{l.cargo}</div>
                  {l.bio && <p className="font-body font-light text-[0.85rem] text-[#888480] leading-relaxed">{l.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
