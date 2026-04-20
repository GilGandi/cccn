'use client'
import { useEffect, useState } from 'react'

type User = { id: string; name: string; email: string; role: string; createdAt: string }
const inp = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"
const empty = { name: '', email: '', password: '', role: 'COLABORADOR' }

export default function AdminUsuarios() {
  const [users, setUsers]       = useState<User[]>([])
  const [form, setForm]         = useState<any>(empty)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  const load = async () => {
    const r = await fetch('/api/usuarios')
    setUsers(await r.json())
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg('')
    const r = await fetch('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setMsg('Usuário criado com sucesso!'); setForm(empty); setShowForm(false); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao criar usuário.') }
    setLoading(false)
  }

  const del = async (id: string, role: string) => {
    if (role === 'ADMIN') return
    if (!confirm('Deletar este usuário?')) return
    const r = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    const d = await r.json()
    if (!r.ok) setMsg(d.error)
    else load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Usuários</h1>
          <p className="font-body text-[0.82rem] text-[#888480]">Gerencie quem tem acesso ao painel</p>
        </div>
        <button onClick={() => { setShowForm(true); setMsg('') }}
          className="px-5 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-[0.15em] uppercase hover:bg-[#c8b99a] transition-colors">
          + Novo usuário
        </button>
      </div>

      {msg && <p className={`mb-4 font-body text-[0.82rem] px-4 py-2 rounded ${msg.includes('sucesso') ? 'text-[#8ec88e] bg-[rgba(140,200,140,0.08)]' : 'text-red-400 bg-[rgba(255,100,100,0.08)]'}`}>{msg}</p>}

      {showForm && (
        <form onSubmit={save} className="mb-8 p-6 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">Novo usuário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nome',  key: 'name',     type: 'text',     placeholder: 'Nome completo' },
              { label: 'Email', key: 'email',    type: 'email',    placeholder: 'email@exemplo.com' },
              { label: 'Senha', key: 'password', type: 'password', placeholder: 'Senha de acesso' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">{f.label} *</label>
                <input required type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={inp}/>
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Perfil de acesso</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inp}>
                <option value="COLABORADOR">Colaborador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar usuário'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 font-body text-[0.7rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {users.length === 0 && <p className="font-body text-[0.85rem] text-[#888480] py-10 text-center">Nenhum usuário encontrado.</p>}
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between p-4 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-display text-[1rem] text-[#f0ede8]">{u.name}</span>
                {u.role === 'ADMIN' && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 bg-[rgba(200,185,154,0.15)] text-[#c8b99a] rounded">Administrador</span>}
              </div>
              <div className="font-body text-[0.75rem] text-[#888480]">{u.email}</div>
            </div>
            {u.role !== 'ADMIN' && (
              <button onClick={() => del(u.id, u.role)}
                className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors shrink-0">
                Deletar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
