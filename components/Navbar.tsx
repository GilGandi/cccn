'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const links = [
  { href: '/',         label: 'Início' },
  { href: '/historia', label: 'Nossa História' },
  { href: '/agenda',   label: 'Agenda' },
  { href: '/palavras', label: 'Palavras' },
  { href: '/doacoes',  label: 'Doações' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/92 backdrop-blur-md animate-fade-down">
      <div className="flex items-center justify-between px-5 sm:px-8 lg:px-16 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="CCCN" width={42} height={42} className="rounded-full" />
          <div className="font-display text-[0.95rem] leading-tight text-[#f0ede8]">
            Comunidade Cristã
            <span className="block font-body text-[0.58rem] tracking-[0.18em] uppercase text-[#c8b99a]">
              de Campos Novos
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8 list-none">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}
                className="font-body text-[0.7rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] transition-colors duration-300">
                {l.label}
              </Link>
            </li>
          ))}
          <li style={{ borderLeft: '1px solid rgba(240,237,232,0.12)', paddingLeft: '2rem' }}>
            <Link href="/admin"
              className="font-body text-[0.7rem] tracking-[0.15em] uppercase text-[#888480]/50 hover:text-[#c8b99a] transition-colors duration-300">
              ⚙ Admin
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
        <button className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8 p-1"
          onClick={() => setOpen(!open)} aria-label="Menu">
          <span className={`block w-full h-px bg-[#f0ede8] transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-full h-px bg-[#f0ede8] transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-full h-px bg-[#f0ede8] transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{ borderTop: '1px solid rgba(240,237,232,0.12)' }}
        className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col py-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="px-6 py-3.5 font-body text-[0.75rem] tracking-[0.15em] uppercase text-[#888480] hover:text-[#f0ede8] hover:bg-[rgba(240,237,232,0.04)] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)}
            className="px-6 py-3.5 font-body text-[0.75rem] tracking-[0.15em] uppercase text-[#888480]/50 hover:text-[#c8b99a] hover:bg-[rgba(240,237,232,0.04)] transition-colors"
            style={{ borderTop: '1px solid rgba(240,237,232,0.08)', marginTop: '0.5rem' }}>
            ⚙ Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
