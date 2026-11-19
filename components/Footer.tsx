import Image from 'next/image'
import FooterYear from './FooterYear'
import { getConfigs } from '@/lib/config'
import { safeExternalHref } from '@/lib/safeUrl'

export default async function Footer() {
  const cfg = await getConfigs()
  const instagramUrl = cfg.instagram_handle
    ? `https://instagram.com/${cfg.instagram_handle}`
    : safeExternalHref(cfg.instagram)
  const facebookUrl = cfg.facebook_handle
    ? `https://facebook.com/${cfg.facebook_handle}`
    : safeExternalHref(cfg.facebook)
  const tiktokUrl = cfg.tiktok_handle
    ? `https://www.tiktok.com/@${cfg.tiktok_handle}`
    : safeExternalHref(cfg.tiktok)

  const socials = [
    instagramUrl && { href: instagramUrl, label: 'Instagram', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg> },
    facebookUrl && { href: facebookUrl, label: 'Facebook', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
    tiktokUrl && { href: tiktokUrl, label: 'TikTok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-4.4v13.67a2.89 2.89 0 0 1-2.9 2.78A2.9 2.9 0 0 1 5.62 15.6a2.9 2.9 0 0 1 2.9-2.9c.3 0 .6.05.87.14V8.35a7.3 7.3 0 0 0-.87-.05 7.3 7.3 0 1 0 7.3 7.3V8.64a9.2 9.2 0 0 0 5.38 1.73V6a4.8 4.8 0 0 1-1.61-.28z"/></svg> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[]

  return (
    <footer style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }} className="bg-[#0a0a0a]">
      <div className="px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt={`Logo ${cfg.nome_curto}`} width={36} height={36} className="rounded-full opacity-70" />
            <div className="font-display text-[0.9rem] text-[#f0ede8] leading-tight">
              {cfg.nome_igreja.split(' de ')[0]}
              <span className="block font-body text-[0.58rem] tracking-[0.15em] uppercase text-[#888480] mt-0.5">
                {cfg.nome_curto} {cfg.subtitulo.split(' ')[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1">
            {socials.map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="text-[#888480] hover:text-[#f0ede8] transition-colors">{s.icon}</a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480]/70">
            {cfg.culto_dia_exibicao || cfg.culto_dia} · {cfg.culto_horario}
          </span>
          <span className="font-body text-[0.65rem] text-[#888480]/60 leading-relaxed">
            {cfg.endereco}<br />{cfg.bairro} · {cfg.cidade_estado}
          </span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }}
        className="px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row justify-between items-start gap-3">
        <p className="font-body text-[0.62rem] text-[#888480]/50 leading-relaxed">
          CNPJ {cfg.cnpj} · {cfg.nome_igreja} — {cfg.subtitulo}<br className="hidden sm:block" />
          <span className="sm:hidden"> · </span>
          {cfg.endereco} · {cfg.bairro} · {cfg.cidade_estado} · CEP {cfg.cep} · Fundada em {cfg.ano_fundacao}
        </p>
        <p className="font-body text-[0.62rem] text-[#888480]/50 whitespace-nowrap shrink-0">© <FooterYear /> {cfg.nome_curto}</p>
      </div>
    </footer>
  )
}
