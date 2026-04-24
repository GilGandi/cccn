export const revalidate = 600

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import ScrollReveal from '@/components/ScrollReveal'
import { prisma } from '@/lib/prisma'

export default async function Lideranca() {
  const lideres = await prisma.lider.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
  })

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />

      {/* Hero */}
      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}
        className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">
            Quem somos
          </span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]"
            style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Nossa <em style={{ color: '#c8b99a' }}>liderança</em>
          </h1>
        </div>
      </div>

      {/* Lista de líderes */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        {lideres.length === 0 ? (
          <p className="font-body text-[0.95rem] text-[#888480] text-center py-20">
            Nenhum líder cadastrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-0" style={{ border: '1px solid rgba(240,237,232,0.08)' }}>
            {lideres.map((l, i) => {
              const inverso = i % 2 !== 0
              return (
                <ScrollReveal key={l.id}>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 ${inverso ? 'md:grid-flow-dense' : ''}`}
                    style={{ borderBottom: i < lideres.length - 1 ? '1px solid rgba(240,237,232,0.08)' : 'none' }}
                  >
                    {/* Foto */}
                    <div className={`relative min-h-[320px] md:min-h-[420px] bg-[#0e0e0e] ${inverso ? 'md:col-start-2' : ''}`}>
                      {l.fotoUrl ? (
                        <Image
                          src={l.fotoUrl} alt={l.nome} fill
                          className="object-cover object-top"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center min-h-[320px]">
                          <div className="w-28 h-28 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[3rem]">
                            {l.nome.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Texto */}
                    <div className={`flex flex-col justify-center px-8 sm:px-12 py-12 ${inverso ? 'md:col-start-1 md:row-start-1' : ''}`}>
                      <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-3 block">
                        {l.cargo}
                      </span>
                      <h2 className="font-display font-normal leading-[1.1] text-[#f0ede8] mb-6"
                        style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
                        {l.nome}
                      </h2>
                      {l.bio && (
                        <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480]">
                          {l.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
