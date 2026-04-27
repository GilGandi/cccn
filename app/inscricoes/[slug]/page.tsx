import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import FormInscricao from '@/components/FormInscricao'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export default async function EventoPage({ params }: Props) {
  const { slug } = await params

  let evento: any = null
  try {
    evento = await prisma.eventoInscricao.findUnique({
      where: { slug },
      include: { _count: { select: { inscricoes: true } } },
    })
  } catch { evento = null }

  if (!evento || !evento.ativo) notFound()

  const encerrado = new Date() > new Date(evento.dataEncerramento)
  const datas: string[] = JSON.parse(evento.datas || '[]')

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div className="max-w-[700px] mx-auto px-6 sm:px-10 pt-40 pb-24">
        <WoodCross opacity={0.025} />
        <div className="relative z-10">
          <Link href="/inscricoes" className="font-body text-[0.65rem] tracking-widest uppercase text-[#555] hover:text-[#c8b99a] transition-colors mb-8 block">
            ← Todos os eventos
          </Link>

          {/* Foto */}
          {evento.fotoUrl && (
            <div className="relative w-full rounded-xl overflow-hidden mb-8 border border-white/[0.06]" style={{ aspectRatio: '16/9' }}>
              <Image src={evento.fotoUrl || ""} alt={evento.titulo} fill className="object-cover" unoptimized />
            </div>
          )}

          <h1 className="font-display text-[2.2rem] text-[#f0ede8] mb-2 leading-tight">{evento.titulo}</h1>

          {/* Datas */}
          {datas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {datas.map((d, i) => (
                <span key={i} className="font-body text-[0.68rem] tracking-widest uppercase px-3 py-1 rounded-full border border-[#c8b99a]/30 text-[#c8b99a]">
                  {new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                </span>
              ))}
            </div>
          )}

          {evento.descricao && (
            <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480] mb-8">{evento.descricao}</p>
          )}

          {/* Vagas */}
          {evento.vagas && (
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#c8b99a]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="font-body text-[0.78rem] text-[#888480]">
                {evento._count.inscricoes} inscritos · {Math.max(0, evento.vagas - evento._count.inscricoes)} vagas restantes
              </span>
            </div>
          )}

          <div style={{ height: 1, background: 'rgba(240,237,232,0.08)' }} className="mb-8" />

          {encerrado ? (
            <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-xl">
              <p className="font-display text-[1.2rem] text-[#555]">Inscrições encerradas</p>
              <p className="font-body text-[0.8rem] text-[#444] mt-2">O período de inscrição para este evento já terminou.</p>
            </div>
          ) : (
            <FormInscricao
              eventoId={evento.id}
              eventoSlug={evento.slug}
              telefoneObrig={evento.telefoneObrig}
              sexoObrig={evento.sexoObrig}
              idadeObrig={evento.idadeObrig}
              campoAnexoLabel={(evento as any).campoAnexoLabel || null}
              enderecoObrig={(evento as any).enderecoObrig || false}
              vagasRestantes={evento.vagas ? evento.vagas - evento._count.inscricoes : null}
            />
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
