'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin',          label: 'Dashboard',  icon: '⬛' },
  { href: '/admin/agenda',   label: 'Agenda',      icon: '📅' },
  { href: '/admin/palavras', label: 'Palavras',    icon: '🎙' },
  { href: '/admin/avisos',   label: 'Avisos',      icon: '📢' },
  { href: '/admin/galeria',  label: 'Galeria',     icon: '🖼' },
  { href: '/admin/usuarios', label: 'Usuários',    icon: '👥' },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-[rgba(240,237,232,0.08)] bg-[#0a0a0a] flex flex-col min-h-screen">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[rgba(240,237,232,0.08)]">
        <Image src="/logo.png" alt="CCCN" width={32} height={32} className="rounded-full" />
        <span className="font-display text-[0.85rem] text-[#f0ede8] leading-tight">
          Admin<br />
          <span className="font-body text-[0.58rem] tracking-widest uppercase text-[#888480]">CCCN</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {links.map((l) => {
          const active = path === l.href || (l.href !== '/admin' && path.startsWith(l.href))
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-[0.75rem] font-body transition-colors
                ${active
                  ? 'bg-[rgba(200,185,154,0.12)] text-[#f0ede8]'
                  : 'text-[#888480] hover:text-[#f0ede8] hover:bg-[rgba(240,237,232,0.04)]'
                }`}>
              <span className="text-[0.85rem]">{l.icon}</span>
              {l.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[rgba(240,237,232,0.08)]">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-[0.75rem] font-body text-[#888480] hover:text-[#f0ede8] hover:bg-[rgba(240,237,232,0.04)] transition-colors mb-1">
          🌐 Ver site
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-[0.75rem] font-body text-[#888480] hover:text-red-400 hover:bg-[rgba(240,237,232,0.04)] transition-colors">
          🚪 Sair
        </button>
      </div>
    </aside>
  )
}
