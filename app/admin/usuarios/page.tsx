'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'

type User = { id: string; name: string; email: string; role: string; createdAt: string }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const emptyForm = { name: '', email: '', password: '', role: 'EDITOR' }

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
}

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'text-[#c8b99a] bg-[#c8b99a]/10',
  ADMIN: 'text-blue-400 bg-blue-400/10',
  EDITOR: 'text-[#555] bg-white/[0.04]',
}

export default function AdminUsuarios() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id
  const currentRole   = (session?.user as any)?.role ?? ''
  const isSuperAdmin  = currentRole === 'SUPERADMIN'

  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'novo' | 'editar' | null>(null)
  const [form, setForm]       = useState<any>(emptyForm)
  const [editId, setEditId]   = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/usuarios')
    if (r.ok) setUsers(await r.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo = () => { setForm(emptyForm); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (u: User) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditId(u.id); setMsg(''); setModal('editar')
  }

  // Roles disponíveis para o select — depende de quem está criando
  const roleOptions = isSuperAdmin
    ? [{ value: 'EDITOR', label: 'Editor' }, { value: 'ADMIN', label: 'Administrador' }]
    : [{ value: 'EDITOR', label: 'Editor' }]

  const save = async () => {
    if (!form.name || !form.email) { setMsg('Nome e e-mail são obrigatórios.'); return }
    if (modal === 'novo' && !form.password) { setMsg('Informe uma senha.'); return }
    setSaving(true); setMsg('')

    const url    = editId ? `/api/usuarios/${editId}` : '/api/usuarios'
    const method = editId ? 'PUT' : 'POST'
    const body   = editId
      ? { name: form.name, email: form.email, ...(form.password ? { password: form.password } : {}) }
      : { name: form.name, email: form.email, password: form.password, role: form.role }

    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (u: User) => {
    if (!confirm(`Excluir o usuário "${u.name}"?`)) return
    const r = await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' })
    if (!r.ok) { const d = await r.json(); setMsg(d.error || 'Erro ao excluir.') }
    else load()
  }

  // Determina se o usuário atual pode editar/excluir um alvo
  const canEdit = (u: User) => {
    if (u.id === currentUserId) return true // sempre pode editar a si mesmo
    if (currentRole === 'SUPERADMIN') return true
    if (currentRole === 'ADMIN' && u.role === 'EDITOR') return true
    return false
  }
  const canDelete = (u: User) => {
    if (u.id === currentUserId) return false // nunca pode excluir a si mesmo
    if (u.role === 'SUPERADMIN') return false // SUPERADMIN nunca pode ser excluído
    if (currentRole === 'SUPERADMIN') return true
    if (currentRole === 'ADMIN' && u.role === 'EDITOR') return true
    return false
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Usuários</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Gerencie quem tem acesso ao painel</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo usuário
        </button>
      </div>

      {msg && !modal && (
        <p className="mb-4 font-body text-[0.8rem] text-red-400 bg-red-500/[0.08] px-4 py-2.5 rounded-lg">{msg}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        {users.length === 0 && (
          <p className="col-span-2 text-center py-16 font-body text-[0.85rem] text-[#444]">Nenhum usuário encontrado.</p>
        )}
        {users.map(u => (
          <div key={u.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            <div className="w-9 h-9 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[0.9rem] shrink-0">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-body text-[0.88rem] text-[#f0ede8]">{u.name}</span>
                {u.id === currentUserId && (
                  <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#c8b99a]/10 text-[#c8b99a]">Você</span>
                )}
                <span className={`font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || ROLE_COLORS.EDITOR}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
              </div>
              <div className="font-body text-[0.75rem] text-[#555] mt-0.5">{u.email}</div>
            </div>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit(u) && (
                <button onClick={() => openEditar(u)}
                  className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              )}
              {canDelete(u) && (
                <button onClick={() => del(u)}
                  className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all" title="Excluir">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo usuário' : 'Editar usuário'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Nome *</label>
              <input className={inp} placeholder="Nome completo" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div>
              <label className={lbl}>E-mail *</label>
              <input type="email" className={inp} placeholder="email@exemplo.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>{modal === 'editar' ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
              <input type="password" className={inp} placeholder={modal === 'editar' ? '••••••••' : 'Mínimo 8 caracteres'} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            {/* Role — só na criação, não na edição */}
            {modal === 'novo' && (
              <div>
                <label className={lbl}>Perfil</label>
                <select className={inp} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <p className="font-body text-[0.6rem] text-[#555] mt-1">
                  {form.role === 'EDITOR'
                    ? 'Editor pode gerenciar conteúdo (agenda, avisos, galeria, etc.) mas não pode acessar Usuários e Configurações.'
                    : 'Administrador tem acesso total exceto exclusão de outros administradores.'}
                </p>
              </div>
            )}
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Criar usuário' : 'Salvar alterações'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
