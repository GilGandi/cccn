'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'

type User = { id: string; name: string; username: string; role: string; perfilId: string | null; perfil?: { nome: string } | null; createdAt: string }
type Perfil = { id: string; nome: string; descricao: string | null; sistema: boolean }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const emptyForm = { name: '', username: '', password: '', role: 'EDITOR', perfilId: '' }

const ROLE_LABELS: Record<string, string> = { SUPERADMIN: 'Super Admin', ADMIN: 'Administrador', EDITOR: 'Editor' }
const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'text-[#c8b99a] bg-[#c8b99a]/10',
  ADMIN: 'text-blue-400 bg-blue-400/10',
  EDITOR: 'text-[#555] bg-white/[0.04]',
}
const ROLE_DESCS: Record<string, string> = {
  ADMIN: 'Acesso total ao sistema exceto gerenciar Super Admins e Perfis do sistema.',
  EDITOR: 'Gerencia conteúdo (agenda, avisos, galeria, etc.) mas não acessa Usuários nem Configurações.',
}

export default function AdminUsuarios() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id
  const currentRole   = (session?.user as any)?.role ?? ''
  const isSuperAdmin  = currentRole === 'SUPERADMIN'

  const [users, setUsers]     = useState<User[]>([])
  const [perfis, setPerfis]   = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'novo' | 'editar' | null>(null)
  const [form, setForm]       = useState<any>(emptyForm)
  const [editId, setEditId]   = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const load = async () => {
    setLoading(true)
    const [u, p] = await Promise.all([
      fetch('/api/usuarios').then(r => r.ok ? r.json() : []),
      fetch('/api/perfis').then(r => r.ok ? r.json() : []),
    ])
    setUsers(u); setPerfis(p); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo = () => { setForm(emptyForm); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (u: User) => {
    setForm({ name: u.name, username: u.username, password: '', role: u.role, perfilId: u.perfilId || '' })
    setEditId(u.id); setMsg(''); setModal('editar')
  }

  // Roles que o usuário atual pode criar
  const roleOptions = [
    { value: 'EDITOR', label: 'Editor' },
    ...(isSuperAdmin ? [{ value: 'ADMIN', label: 'Administrador' }] : []),
  ]

  // Perfis customizados (não-sistema) disponíveis para associar
  const perfisCustos = perfis.filter(p => !p.sistema)

  const save = async () => {
    if (!form.name || !form.username) { setMsg('Nome e usuário são obrigatórios.'); return }
    if (modal === 'novo' && !form.password) { setMsg('Informe uma senha.'); return }
    setSaving(true); setMsg('')

    const url    = editId ? `/api/usuarios/${editId}` : '/api/usuarios'
    const method = editId ? 'PUT' : 'POST'
    const body   = editId
      ? { name: form.name, username: form.username, ...(form.password ? { password: form.password } : {}) }
      : { name: form.name, username: form.username, password: form.password, role: form.role, perfilId: form.perfilId || null }

    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (u: User) => {
    if (!confirm(`Excluir o usuário "${u.name}"?`)) return
    const r = await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' })
    if (!r.ok) { const d = await r.json(); setMsg(d.error) }
    else load()
  }

  const canEdit   = (u: User) => u.id === currentUserId || isSuperAdmin || (currentRole === 'ADMIN' && u.role === 'EDITOR')
  const canDelete = (u: User) => u.id !== currentUserId && u.role !== 'SUPERADMIN' && (isSuperAdmin || (currentRole === 'ADMIN' && u.role === 'EDITOR'))

  // Label do perfil a exibir
  const perfilLabel = (u: User) => {
    if (u.perfil?.nome) return u.perfil.nome
    return ROLE_LABELS[u.role] || u.role
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

      {msg && !modal && <p className="mb-4 font-body text-[0.8rem] text-red-400 bg-red-500/[0.08] px-4 py-2.5 rounded-lg">{msg}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {users.length === 0 && <p className="col-span-2 text-center py-16 font-body text-[0.85rem] text-[#444]">Nenhum usuário encontrado.</p>}
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
              <div className="w-9 h-9 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[0.9rem] shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-[0.88rem] text-[#f0ede8]">{u.name}</span>
                  <span className="font-body text-[0.72rem] text-[#555]">@{u.username}</span>
                  {u.id === currentUserId && (
                    <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#c8b99a]/10 text-[#c8b99a]">Você</span>
                  )}
                  <span className={`font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || ROLE_COLORS.EDITOR}`}>
                    {perfilLabel(u)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit(u) && (
                  <button onClick={() => openEditar(u)}
                    className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
                {canDelete(u) && (
                  <button onClick={() => del(u)}
                    className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Nome *</label>
                <input className={inp} placeholder="Nome completo" value={form.name} autoFocus
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Usuário (login) *</label>
                <input className={inp} placeholder="joao.silva" value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} />
              </div>
            </div>
            <div>
              <label className={lbl}>{modal === 'editar' ? 'Nova senha (em branco = manter)' : 'Senha *'}</label>
              <input type="password" className={inp} placeholder="Mínimo 8 caracteres" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {/* Role + Perfil — só na criação */}
            {modal === 'novo' && (
              <>
                <div>
                  <label className={lbl}>Tipo de acesso</label>
                  <div className="flex flex-col gap-2">
                    {roleOptions.map(r => (
                      <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${form.role === r.value ? 'border-[#c8b99a]/40 bg-[#c8b99a]/[0.04]' : 'border-white/[0.06] hover:border-white/[0.12]'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                          ${form.role === r.value ? 'border-[#c8b99a]' : 'border-white/20'}`}
                          onClick={() => setForm({ ...form, role: r.value, perfilId: '' })}>
                          {form.role === r.value && <div className="w-2 h-2 rounded-full bg-[#c8b99a]" />}
                        </div>
                        <div onClick={() => setForm({ ...form, role: r.value, perfilId: '' })}>
                          <div className="font-body text-[0.82rem] text-[#f0ede8]">{r.label}</div>
                          <div className="font-body text-[0.65rem] text-[#555] mt-0.5">{ROLE_DESCS[r.value]}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Perfil customizado */}
                {perfisCustos.length > 0 && (
                  <div>
                    <label className={lbl}>Perfil customizado (opcional)</label>
                    <select className={inp} value={form.perfilId}
                      onChange={e => setForm({ ...form, perfilId: e.target.value })}>
                      <option value="">Usar perfil padrão do tipo selecionado</option>
                      {perfisCustos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}{p.descricao ? ` — ${p.descricao}` : ''}</option>
                      ))}
                    </select>
                    <p className="font-body text-[0.6rem] text-[#555] mt-1">
                      Perfis customizados permitem permissões específicas além do tipo base.
                    </p>
                  </div>
                )}
              </>
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
