export const revalidate = 0

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import AgendaFiltro from '@/components/AgendaFiltro'
import BotaoNotificacao from '@/components/BotaoNotificacao'
import { prisma } from '@/lib/prisma'

export default async function Agenda() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const seisM = new Date()
  seisM.setMonth(seisM.getMonth() + 6)

  const [eventos, categorias] = await Promise.all([
    prisma.evento.findMany({
      where: { data: { gte: hoje, lte: seisM } },
      include: { categoria: { select: { id: true, nome: true, cor: true, fotoUrl: true } } },
      orderBy: { data: 'asc' },
    }),
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
  ])

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }} className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Calendário</span>
          <div className="flex items-center mb-4">
            <BotaoNotificacao />
          </div>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Agenda de <em style={{ color: '#c8b99a' }}>cultos e eventos</em>
          </h1>
        </div>
      </div>
      <AgendaFiltro eventos={JSON.parse(JSON.stringify(eventos))} categorias={JSON.parse(JSON.stringify(categorias))} />
      <Footer />
    </main>
  )
}
