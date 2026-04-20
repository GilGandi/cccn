import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [eventos, palavras, avisos, usuarios] = await Promise.all([
    prisma.evento.count(),
    prisma.palavra.count(),
    prisma.aviso.count({ where: { ativo: true } }),
    prisma.user.count(),
  ])

  const cards = [
    { label: 'Eventos cadastrados', value: eventos,  href: '/admin/agenda',   color: '#7ba4d4' },
    { label: 'Palavras publicadas', value: palavras, href: '/admin/palavras', color: '#8ec88e' },
    { label: 'Avisos ativos',       value: avisos,   href: '/admin/avisos',   color: '#c8b99a' },
    { label: 'Usuários',            value: usuarios, href: '/admin/usuarios', color: '#d494a8' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[1.8rem] text-[#f0ede8] mb-1">Dashboard</h1>
        <p className="font-body text-[0.85rem] text-[#888480]">Painel administrativo da C.C.C.N</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <a key={c.label} href={c.href}
            className="block p-5 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] hover:border-[rgba(240,237,232,0.2)] transition-colors">
            <div className="font-display text-[2.2rem] font-medium mb-1" style={{ color: c.color }}>{c.value}</div>
            <div className="font-body text-[0.75rem] text-[#888480]">{c.label}</div>
          </a>
        ))}
      </div>

      <div className="p-5 rounded border border-[rgba(200,185,154,0.2)] bg-[rgba(200,185,154,0.04)]">
        <p className="font-body text-[0.65rem] text-[#c8b99a] mb-1 font-medium tracking-wide uppercase">Primeiro acesso?</p>
        <p className="font-body text-[0.85rem] text-[#888480]">
          Use o menu lateral para gerenciar agenda, palavras, avisos, galeria e usuários.
          O site público atualiza automaticamente assim que você salvar as alterações.
        </p>
      </div>
    </div>
  )
}
