import Link from 'next/link'
import Image from 'next/image'

const links = [
  { href: '/',         label: 'Início' },
  { href: '/historia', label: 'Nossa História' },
  { href: '/agenda',   label: 'Agenda' },
  { href: '/palavras', label: 'Palavras' },
  { href: '/doacoes',  label: 'Doações' },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }} className="bg-[#0a0a0a]">
      <div className="px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
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
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <a href="https://instagram.com/cccnchurch" target="_blank" rel="noopener noreferrer"
            className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors">
            Instagram @cccnchurch
          </a>
          <a href="tel:+554991529414"
            className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors">
            (49) 9152-9414
          </a>
          <a href="https://wa.me/554991529414" target="_blank" rel="noopener noreferrer"
            className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors">
            WhatsApp
          </a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }}
        className="px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row justify-between items-start gap-3">
        <p className="font-body text-[0.62rem] text-[#888480]/50 leading-relaxed">
          CNPJ 18.702.714/0001-07 · Comunidade Cristã de Campos Novos — C.C.C.N Ministério Apostólico do Coração de Deus<br className="hidden sm:block"/>
          <span className="sm:hidden"> · </span>
          Rua João Gonçalves de Araújo, 829 · Bairro Aparecida · Campos Novos – SC · CEP 89620-000 · Fundada em 2013
        </p>
        <p className="font-body text-[0.62rem] text-[#888480]/50 whitespace-nowrap shrink-0">
          © {new Date().getFullYear()} C.C.C.N.
        </p>
      </div>
    </footer>
  )
}
