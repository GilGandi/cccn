import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import ScrollReveal from '@/components/ScrollReveal'
import CopyPix from '@/components/CopyPix'
import VersiculoAleatorio from '@/components/VersiculoAleatorio'
import { getConfigs } from '@/lib/config'
import { safeExternalHref } from '@/lib/safeUrl'

export const revalidate = 0

export default async function Home() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const seisM = new Date()
  seisM.setMonth(seisM.getMonth() + 6)

  const [agenda, cfg] = await Promise.all([
    prisma.evento.findMany({
      where: { data: { gte: hoje, lte: seisM } },
      include: { categoria: { select: { nome: true, cor: true } } },
      orderBy: { data: 'asc' },
      take: 6,
    }).catch(() => []),
    getConfigs(),
  ])

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        <WoodCross opacity={0.04} />
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(200,185,154,0.07) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-up delay-300">
            <Image src="/logo.png" alt={`Logo ${cfg.nome_igreja}`} width={88} height={88} className="rounded-full" priority />
          </div>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8] animate-fade-up delay-500" style={{ fontSize: 'clamp(2.4rem,8vw,5.2rem)' }}>
            {cfg.hero_subtitulo.split(' em Cristo')[0]}<br />
            <em style={{ color: '#c8b99a' }}>sua família</em> em Cristo
          </h1>
          <p className="mt-5 font-body font-light text-[0.75rem] tracking-[0.22em] uppercase text-[#888480] animate-fade-up delay-700">
            {cfg.cidade}
          </p>
          <div className="w-px h-12 my-8 animate-fade-up delay-900" style={{ background: 'linear-gradient(to bottom, transparent, #c8b99a, transparent)' }} />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-up delay-1100">
            <Link href="/historia" className="px-8 py-3 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.72rem] tracking-[0.18em] uppercase hover:bg-[#c8b99a] transition-colors text-center">
              Nossa história
            </Link>
            <Link href="/agenda" className="px-8 py-3 font-body font-light text-[0.72rem] tracking-[0.18em] uppercase text-[#f0ede8] transition-colors text-center" style={{ border: '1px solid rgba(240,237,232,0.3)' }}>
              Ver agenda
            </Link>
          </div>
        </div>
      </section>

      {/* ── CULTOS STRIP ── */}
      <div className="relative overflow-hidden" style={{ borderTop: '1px solid rgba(240,237,232,0.12)', borderBottom: '1px solid rgba(240,237,232,0.12)' }}>
        <WoodCross opacity={0.025} />
        <div className="relative z-10 flex flex-col sm:flex-row">
          {[
            { label: 'Culto principal', value: cfg.culto_dia_exibicao || cfg.culto_dia },
            { label: 'Horário',         value: cfg.culto_horario },
            { label: 'Endereço',        value: `${cfg.endereco}\n${cfg.bairro}` },
          ].map((item, i) => (
            <div key={i} className="flex-1 px-6 py-7 text-center"
              style={{ borderBottom: i < 2 ? '1px solid rgba(240,237,232,0.12)' : 'none' }}>
              <div className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-[#c8b99a] mb-2">{item.label}</div>
              <div className="font-display text-[1.4rem] text-[#f0ede8] whitespace-pre-line leading-snug">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NOSSA HISTÓRIA ── */}
      <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }} className="relative overflow-hidden">
        <WoodCross opacity={0.035} />
        <ScrollReveal>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
            <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Nossa História</span>
            <h2 className="font-display font-normal leading-[1.2] text-[#f0ede8] mb-6" style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)' }}>
              Uma comunidade <em style={{ color: '#c8b99a' }}>enraizada na fé,</em><br />
              aberta ao mundo
            </h2>
            <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480] max-w-[640px] mb-10">
              {cfg.home_historia}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'rgba(240,237,232,0.12)', border: '1px solid rgba(240,237,232,0.12)' }}>
              {[
                { num: '01', title: cfg.home_card1_titulo, desc: cfg.home_card1_desc },
                { num: '02', title: cfg.home_card2_titulo, desc: cfg.home_card2_desc },
                { num: '03', title: cfg.home_card3_titulo, desc: cfg.home_card3_desc },
              ].map((v) => (
                <div key={v.num} className="bg-[#0a0a0a] p-7">
                  <span className="font-display text-[2rem] text-[#c8b99a] opacity-50 block mb-2 leading-none">{v.num}</span>
                  <strong className="block font-body font-medium text-[0.78rem] tracking-[0.12em] uppercase text-[#f0ede8] mb-2">{v.title}</strong>
                  <p className="font-body font-light text-[0.85rem] text-[#888480] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── VERSÍCULO ── */}
      <VersiculoAleatorio />

      {/* ── AGENDA ── */}
      <ScrollReveal>
        <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }} className="relative overflow-hidden">
          <WoodCross opacity={0.03} />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
              <div>
                <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-2 block">Calendário</span>
                <h2 className="font-display font-normal leading-[1.2] text-[#f0ede8]" style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)' }}>
                  Agenda de <em style={{ color: '#c8b99a' }}>cultos e eventos</em>
                </h2>
              </div>
              <Link href="/agenda" className="shrink-0 px-6 py-2.5 font-body font-light text-[0.68rem] tracking-[0.18em] uppercase text-[#f0ede8] transition-colors"
                style={{ border: '1px solid rgba(240,237,232,0.3)' }}>
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{ border: '1px solid rgba(240,237,232,0.12)', gap: 1, background: 'rgba(240,237,232,0.12)' }}>
              {agenda.length === 0 && (
                <div className="col-span-3 py-16 text-center">
                  <p className="font-body text-[0.88rem] text-[#888480]">Nenhum evento cadastrado ainda.</p>
                </div>
              )}
              {agenda.map((item: any) => {
                const data = new Date(item.data)
                const dia = data.getUTCDate().toString().padStart(2, '0')
                const cor = item.categoria?.cor || '#c8b99a'
                const borda = item.categoria ? cor + '55' : 'rgba(240,237,232,0.25)'
                return (
                  <div key={item.id} className="relative p-6 bg-[#0a0a0a] transition-colors">
                    <span className="inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 mb-4"
                      style={{ border: `1px solid ${borda}`, color: cor }}>
                      {item.categoria?.nome || 'Evento'}
                    </span>
                    <div className="absolute top-6 right-6 font-body text-[0.62rem] text-[#888480]">{item.horario}</div>
                    <div className="font-display text-[2rem] text-[#c8b99a] leading-none mb-1">{dia}</div>
                    <div className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480] mb-3">
                      {data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', weekday: 'short', timeZone: 'UTC' })}
                    </div>
                    <div className="font-display text-[1.2rem] text-[#f0ede8] mb-1">{item.titulo}</div>
                    <p className="font-body font-light text-[0.8rem] text-[#888480] leading-relaxed">{item.descricao}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── MAPA ── */}
      <ScrollReveal>
        <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }} className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative overflow-hidden px-6 sm:px-10 lg:px-16 py-14 flex flex-col justify-center gap-7">
            <WoodCross opacity={0.04} />
            <div className="relative z-10">
              <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-2 block">Como chegar</span>
              <h2 className="font-display font-normal leading-[1.2] text-[#f0ede8]" style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)' }}>
                Venha nos <em style={{ color: '#c8b99a' }}>visitar</em>
              </h2>
            </div>
            {[
              { label: 'Endereço',        value: `${cfg.endereco}\n${cfg.bairro} · ${cfg.cidade_estado}` },
              { label: 'Culto principal', value: `${cfg.culto_dia_exibicao || cfg.culto_dia} às ${cfg.culto_horario}` },
              { label: 'Telefone',        value: cfg.telefone, href: `tel:${cfg.telefone_link}` },
              { label: 'Instagram',       value: '@' + (cfg.instagram_handle || (cfg.instagram.split('/').pop() || '')), href: cfg.instagram_handle ? `https://instagram.com/${cfg.instagram_handle}` : (safeExternalHref(cfg.instagram) || '#') },
            ].map((item) => (
              <div key={item.label} className="relative z-10">
                <div className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-[#c8b99a] mb-1">{item.label}</div>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer"
                    className="font-body font-light text-[0.92rem] text-[#c8b99a] leading-relaxed whitespace-pre-line hover:underline">{item.value}</a>
                ) : (
                  <div className="font-body font-light text-[0.92rem] text-[#f0ede8] leading-relaxed whitespace-pre-line">{item.value}</div>
                )}
              </div>
            ))}
            <div className="relative z-10">
              <a href={safeExternalHref(cfg.maps_link) || "#"} target="_blank" rel="noopener noreferrer"
                className="inline-block px-7 py-3 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-[0.18em] uppercase hover:bg-[#c8b99a] transition-colors">
                Abrir no Google Maps
              </a>
            </div>
          </div>
          <div className="min-h-[360px] md:min-h-0" style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d900!2d-51.2109056!3d-27.3975733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94e17b01bab8202b%3A0x2524dd437a651fe5!2sComunidade%20Crist%C3%A3%20de%20Campos%20Novos!5e0!3m2!1spt-BR!2sbr!4v1681000000000!5m2!1spt-BR!2sbr"
              width="100%" height="100%"
              style={{ border: 0, minHeight: 360, display: 'block' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* ── DOAÇÕES ── */}
      <ScrollReveal>
        <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)', background: 'rgba(200,185,154,0.02)' }} className="relative overflow-hidden">
          <WoodCross opacity={0.04} />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
            <div>
              <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-3 block">Contribua</span>
              <h2 className="font-display font-normal leading-[1.2] text-[#f0ede8] mb-5" style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)' }}>
                Apoie a obra de <em style={{ color: '#c8b99a' }}>Deus</em>
              </h2>
              <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480]">{cfg.doacoes_texto}</p>
            </div>
            <div className="flex flex-col gap-5 p-7 sm:p-10" style={{ border: '1px solid rgba(240,237,232,0.12)' }}>
              <div>
                <div className="font-body text-[0.62rem] tracking-[0.25em] uppercase text-[#c8b99a] mb-1">Chave Pix</div>
                <div className="font-display text-[1.2rem] text-[#f0ede8] tracking-wide break-all">{cfg.pix_chave}</div>
                <div className="font-body text-[0.73rem] text-[#888480] mt-0.5">{cfg.pix_tipo} — Transferência instantânea</div>
              </div>
              <div style={{ height: 1, background: 'rgba(240,237,232,0.12)' }} />
              <p className="font-body font-light text-[0.82rem] text-[#888480] leading-relaxed">
                Copie a chave e realize sua doação pelo aplicativo do banco. Toda contribuição é destinada integralmente ao ministério.
              </p>
              <CopyPix chave={cfg.pix_chave} />
            </div>
          </div>
        </div>
      </ScrollReveal>

      <Footer />
    </main>
  )
}
