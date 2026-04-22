'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type User = { id: string; name: string; email: string; role: string; createdAt: string }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const emptyForm = { name: '', email: '', password: '', role: 'COLABORADOR' }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display text-[1rem] text-[#f0ede8]">{title}</h2>
          <button onClick={onClose} className="text-[#555] hover:text-[#f0ede8] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function AdminUsuarios() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id

  const [users, setUsers]   = useState<User[]>([])
  const [modal, setModal]   = useState<'novo' | 'editar' | null>(null)
  const [form, setForm]     = useState<any>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = async () => {
    const r = await fetch('/api/usuarios')
    if (r.ok) setUsers(await r.json())
  }
  useEffect(() => { load() }, [])

  const openNovo = () => { setForm(emptyForm); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (u: User) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditId(u.id); setMsg(''); setModal('editar')
  }

  const save = async () => {
    if (!form.name || !form.email) { setMsg('Nome e e-mail são obrigatórios.'); return }
    if (modal === 'novo' && !form.password) { setMsg('Informe uma senha.'); return }
    setSaving(true); setMsg('')

    const url    = editId ? `/api/usuarios/${editId}` : '/api/usuarios'
    const method = editId ? 'PUT' : 'POST'
    const body   = editId
      ? { name: form.name, email: form.email, ...(form.password ? { password: form.password } : {}) }
      : form

    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (u: User) => {
    if (u.role === 'ADMIN') return
    if (!confirm(`Excluir o usuário "${u.name}"?`)) return
    const r = await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' })
    if (!r.ok) { const d = await r.json(); setMsg(d.error) }
    else load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-8">
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

      <div className="flex flex-col gap-2">
        {users.length === 0 && (
          <p className="text-center py-16 font-body text-[0.85rem] text-[#444]">Nenhum usuário encontrado.</p>
        )}
        {users.map(u => (
          <div key={u.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[0.9rem] shrink-0">
              {u.name.charAt(0).toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-body text-[0.88rem] text-[#f0ede8]">{u.name}</span>
                {u.id === currentUserId && (
                  <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#c8b99a]/10 text-[#c8b99a]">Você</span>
                )}
                {u.role === 'ADMIN' && (
                  <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-[#888]">Admin</span>
                )}
              </div>
              <div className="font-body text-[0.75rem] text-[#555] mt-0.5">{u.email}</div>
            </div>
            {/* Ações */}
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditar(u)}
                className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all" title="Editar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              {u.role !== 'ADMIN' && (
                <button onClick={() => del(u)}
                  className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all" title="Excluir">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'novo' ? 'Novo usuário' : 'Editar usuário'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Nome *</label>
              <input className={inp} placeholder="Nome completo" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>E-mail *</label>
              <input type="email" className={inp} placeholder="email@exemplo.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>{modal === 'editar' ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
              <input type="password" className={inp} placeholder={modal === 'editar' ? '••••••••' : 'Senha de acesso'} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
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
