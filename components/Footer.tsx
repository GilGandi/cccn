import Link from 'next/link'
import Image from 'next/image'
import FooterYear from './FooterYear'

const links = [
  { href: '/',         label: 'Início' },
  { href: '/historia', label: 'Nossa História' },
  { href: '/agenda',   label: 'Agenda' },
  { href: '/palavras', label: 'Palavras' },
  { href: '/doacoes',  label: 'Doações' },
]

const sociais = [
  {
    href: 'https://instagram.com/cccnchurch',
    label: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: 'https://www.facebook.com/cccnchurch/',
    label: 'Facebook',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    href: 'https://wa.me/554991529414',
    label: 'WhatsApp',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.848L.057 23.899l6.22-1.438A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.516-5.166-1.415l-.371-.22-3.844.888.922-3.741-.242-.384A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }} className="bg-[#0a0a0a]">
      <div className="px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo CCCN" width={36} height={36} className="rounded-full opacity-70" />
            <div className="font-display text-[0.9rem] text-[#f0ede8] leading-tight">
              Comunidade Cristã
              <span className="block font-body text-[0.58rem] tracking-[0.15em] uppercase text-[#888480] mt-0.5">
                C.C.C.N Ministério Apostólico
              </span>
            </div>
          </div>
          {/* Ícones sociais */}
          <div className="flex items-center gap-4 mt-1">
            {sociais.map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label}
                className="text-[#888480] hover:text-[#f0ede8] transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <a href="tel:+554991529414"
            className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors">
            (49) 9152-9414
          </a>
          <span className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480]/50">
            Domingos · 19h às 21h
          </span>
          <span className="font-body text-[0.65rem] text-[#888480]/50 leading-relaxed">
            R. João G. de Araújo, 829<br/>Bairro Aparecida · Campos Novos – SC
          </span>
        </div>
      </div>

      {/* Legal */}
      <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }}
        className="px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row justify-between items-start gap-3">
        <p className="font-body text-[0.62rem] text-[#888480]/50 leading-relaxed">
          CNPJ 18.702.714/0001-07 · Comunidade Cristã de Campos Novos — C.C.C.N Ministério Apostólico do Coração de Deus<br className="hidden sm:block"/>
          <span className="sm:hidden"> · </span>
          Rua João Gonçalves de Araújo, 829 · Bairro Aparecida · Campos Novos – SC · CEP 89620-000 · Fundada em 2013
        </p>
        <p className="font-body text-[0.62rem] text-[#888480]/50 whitespace-nowrap shrink-0">
          © <FooterYear /> C.C.C.N.
        </p>
      </div>
    </footer>
  )
}
