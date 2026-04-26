export const revalidate = 60

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import { prisma } from '@/lib/prisma'

export default async function Inscricoes() {
  let eventos: any[] = []
  try {
    eventos = await prisma.eventoInscricao.findMany({
      where: { ativo: true },
      orderBy: { dataEncerramento: 'asc' },
      include: { _count: { select: { inscricoes: true } } },
    })
  } catch { eventos = [] }

  const hoje = new Date()

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}
        className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Participe</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Eventos e <em style={{ color: '#c8b99a' }}>inscrições</em>
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16">
        {eventos.length === 0 ? (
          <p className="font-body text-[0.95rem] text-[#888480] text-center py-20">Nenhum evento com inscrições abertas no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventos.map(ev => {
              const encerrado = new Date(ev.dataEncerramento) < hoje || !ev.ativo
              const esgotado  = ev.vagas !== null && ev._count.inscricoes >= ev.vagas
              const bloqueado = encerrado || esgotado

              return (
                <div key={ev.id} className={`relative group rounded-xl overflow-hidden border ${bloqueado ? 'border-white/[0.04]' : 'border-white/[0.08] hover:border-[#c8b99a]/30'} transition-all`}>
                  {/* Imagem ou placeholder */}
                  <div className="relative" style={{ aspectRatio: '1/1' }}>
                    {ev.fotoUrl ? (
                      <Image src={ev.fotoUrl} alt={ev.titulo} fill className={`object-cover ${bloqueado ? 'grayscale brightness-50' : 'group-hover:scale-105 transition-transform duration-500'}`} unoptimized />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${bloqueado ? 'bg-[#0e0e0e]' : 'bg-[#111]'}`}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#333]" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                    )}
                    {/* Marca d'água de encerrado */}
                    {bloqueado && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rotate-[-30deg] border-2 border-[#888]/40 px-6 py-2 rounded-sm">
                          <span className="font-display text-[1.1rem] tracking-widest uppercase text-[#888]/60">
                            {esgotado ? 'Esgotado' : 'Encerrado'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={`p-5 ${bloqueado ? 'bg-[#0e0e0e]' : 'bg-[#111]'}`}>
                    <h2 className={`font-display text-[1.1rem] mb-1 ${bloqueado ? 'text-[#555]' : 'text-[#f0ede8]'}`}>{ev.titulo}</h2>
                    <p className="font-body text-[0.72rem] text-[#555] mb-3">
                      Encerra em {new Date(ev.dataEncerramento).toLocaleDateString('pt-BR')}
                      {ev.vagas && <span> · {ev.vagas - ev._count.inscricoes} vagas restantes</span>}
                    </p>
                    {!bloqueado && (
                      <Link href={`/inscricoes/${ev.slug}`}
                        className="inline-block px-5 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.68rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
                        Inscrever-se
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
