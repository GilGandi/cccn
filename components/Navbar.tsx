'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const links = [
  { href: '/',          label: 'Início' },
  { href: '/historia',  label: 'Nossa História' },
  { href: '/lideranca', label: 'Liderança' },
  { href: '/galeria',   label: 'Galeria' },
  { href: '/agenda',    label: 'Agenda' },
  { href: '/palavras',  label: 'Palavras' },
  { href: '/louvor',    label: 'Louvor' },
  { href: '/inscricoes',label: 'Eventos' },
  { href: '/doacoes',   label: 'Doações' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/92 backdrop-blur-md animate-fade-down">

      {/* Barra principal */}
      <div className="flex items-center justify-between px-5 sm:px-8 lg:px-16 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={close}>
          <Image src="/logo.png" alt="CCCN" width={42} height={42} className="rounded-full" />
          <div className="font-display text-[0.95rem] leading-tight text-[#f0ede8]">
            Comunidade Cristã
            <span className="block font-body text-[0.58rem] tracking-[0.18em] uppercase text-[#c8b99a]">
              de Campos Novos
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-6 xl:gap-8 list-none">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}
                className="font-body text-[0.68rem] tracking-[0.12em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors duration-300">
                {l.label}
              </Link>
            </li>
          ))}
          <li style={{ borderLeft: '1px solid rgba(240,237,232,0.12)', paddingLeft: '1.5rem' }}>
            <Link href="/admin"
              className="font-body text-[0.68rem] tracking-[0.12em] uppercase text-[#888480]/50 hover:text-[#c8b99a] transition-colors duration-300">
              ⚙ Admin
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
        <button className="lg:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-1 -mr-1"
          onClick={() => setOpen(!open)} aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
          <span className={`block w-full h-px bg-[#f0ede8] transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-full h-px bg-[#f0ede8] transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-full h-px bg-[#f0ede8] transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu — max-h generoso para caber todos os links */}
      <div style={{ borderTop: open ? '1px solid rgba(240,237,232,0.12)' : 'none' }}
        className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col py-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}
              className="px-6 py-3.5 font-body text-[0.75rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] hover:bg-white/[0.04] transition-colors active:bg-white/[0.08]">
              {l.label}
            </Link>
          ))}
          {/* Admin — sempre visível no final, separado */}
          <div style={{ borderTop: '1px solid rgba(240,237,232,0.08)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <Link href="/admin" onClick={close}
              className="flex items-center gap-2 px-6 py-3.5 font-body text-[0.75rem] tracking-[0.15em] uppercase text-[#c8b99a]/70 hover:text-[#c8b99a] hover:bg-white/[0.04] transition-colors active:bg-white/[0.08]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Painel administrativo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
