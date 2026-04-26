'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

type NavLink = { href: string; label: string; icon: React.ReactNode; minRole?: 'ADMIN' | 'SUPERADMIN' }

const links: NavLink[] = [
  { href: '/admin/agenda',   label: 'Agenda',   icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { href: '/admin/palavras', label: 'Palavras',  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
  )},
  { href: '/admin/avisos',   label: 'Avisos',    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  )},
  { href: '/admin/louvor',   label: 'Louvor',    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  )},
  { href: '/admin/galeria',  label: 'Galeria',   icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  )},
  { href: '/admin/eventos-inscricao', label: 'Eventos',    minRole: undefined as any, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  )},
  { href: '/admin/participantes', label: 'Participantes', minRole: undefined as any, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { href: '/admin/perfis', label: 'Perfis', minRole: 'SUPERADMIN' as any, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  )},
  { href: '/admin/lideres',       label: 'Liderança',    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { href: '/admin/configuracoes', label: 'Configurações', minRole: 'ADMIN', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  )},
  { href: '/admin/usuarios', label: 'Usuários', minRole: 'ADMIN',  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
]

function SidebarContent({ path, userName, userRole, perfilNome, onNav }: { path: string; userName: string; userRole: string; perfilNome?: string; onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <Image src="/logo.png" alt="CCCN" width={34} height={34} className="rounded-full opacity-90" />
        <div>
          <div className="font-display text-[0.82rem] text-[#f0ede8] leading-tight">CCCN</div>
          <div className="font-body text-[0.58rem] tracking-[0.2em] uppercase text-[#888480] mt-0.5">Painel Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2.5 flex-1 pt-3">
        <p className="font-body text-[0.55rem] tracking-[0.2em] uppercase text-[#555] px-3 mb-2">Menu</p>
        {links.filter(l => {
          if (!l.minRole) return true
          const levels: Record<string, number> = { EDITOR: 1, ADMIN: 2, SUPERADMIN: 3 }
          return (levels[userRole] || 0) >= (levels[l.minRole] || 0)
        }).map((l) => {
          const active = path === l.href || (l.href !== '/admin' && path.startsWith(l.href))
          return (
            <Link key={l.href} href={l.href} onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.78rem] font-body transition-all duration-150
                ${active
                  ? 'bg-[#c8b99a]/10 text-[#c8b99a] font-medium'
                  : 'text-[#666] hover:text-[#f0ede8] hover:bg-white/[0.04]'
                }`}>
              <span className={active ? 'text-[#c8b99a]' : 'text-[#555]'}>{l.icon}</span>
              {l.label}
              {active && <span className="ml-auto w-1 h-1 rounded-full bg-[#c8b99a]" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#c8b99a]/15 flex items-center justify-center text-[#c8b99a] text-[0.65rem] font-display shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-body text-[0.75rem] text-[#f0ede8] truncate">{userName}</div>
            <div className="font-body text-[0.58rem] text-[#555] uppercase tracking-widest">
              {perfilNome || (userRole === 'SUPERADMIN' ? 'Super Admin' : userRole === 'ADMIN' ? 'Administrador' : 'Editor')}
            </div>
          </div>
        </div>
        <Link href="/" target="_blank" rel="noopener noreferrer" onClick={onNav}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[0.75rem] font-body text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.04] transition-all mb-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Ver site
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[0.75rem] font-body text-[#555] hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const path = usePathname()
  const { data: session } = useSession()
  const userName = session?.user?.name ?? 'Usuário'
  const userRole   = (session?.user as any)?.role ?? 'EDITOR'
  const perfilNome = (session?.user as any)?.perfilNome as string | undefined
  const [open, setOpen] = useState(false)
  const currentLabel = links.find(l => path === l.href || (l.href !== '/admin' && path.startsWith(l.href)))?.label ?? 'Menu'

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-[#0c0c0c] border-r border-white/[0.06] flex-col min-h-screen">
        <SidebarContent path={path} userName={userName} userRole={userRole} perfilNome={perfilNome} />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-sm border-b border-white/[0.06] flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="CCCN" width={28} height={28} className="rounded-full opacity-90" />
          <span className="font-body text-[0.78rem] text-[#f0ede8]">{currentLabel}</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 text-[#888] hover:text-[#f0ede8] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <div className="relative w-64 bg-[#0c0c0c] border-r border-white/[0.06] h-full flex flex-col"
            style={{ animation: 'slideIn 0.2s ease both' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="font-display text-[0.85rem] text-[#f0ede8]">Menu</span>
              <button onClick={() => setOpen(false)} className="text-[#555] hover:text-[#f0ede8] transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent path={path} userName={userName} userRole={userRole} perfilNome={perfilNome} onNav={() => setOpen(false)} />
            </div>
          </div>
          <style>{`@keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
        </div>
      )}
    </>
  )
}
