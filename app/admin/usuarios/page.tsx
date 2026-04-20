'use client'
import { useEffect, useState } from 'react'

type User = { id: string; name: string; email: string; role: string; ministerio: string; createdAt: string }
const MINISTERIOS = ['GERAL','HOMENS','MULHERES','JOVENS','FAMILIA','CELULAS']
const LABELS: Record<string,string> = { GERAL:'Geral', HOMENS:'Homens', MULHERES:'Mulheres', JOVENS:'Jovens', FAMILIA:'Família', CELULAS:'Células' }
const input = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"
const empty = { name:'', email:'', password:'', role:'LIDER', ministerio:'GERAL' }

export default function AdminUsuarios() {
  const [users, setUsers]   = useState<User[]>([])
  const [form, setForm]     = useState<any>(empty)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = async () => {
    const r = await fetch('/api/usuarios')
    setUsers(await r.json())
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg('')
    const r = await fetch('/api/usuarios', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (r.ok) {
      setMsg('Usuário criado com sucesso!'); setForm(empty); setShowForm(false); load()
    } else {
      const d = await r.json(); setMsg(d.error || 'Erro ao criar usuário.')
    }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm('Deletar este usuário?')) return
    await fetch(`/api/usuarios/${id}`, { method:'DELETE' })
    load()
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

      {msg && <p className={`mb-4 font-body text-[0.82rem] ${msg.includes('sucesso') ? 'text-[#8ec88e]' : 'text-red-400'}`}>{msg}</p>}

      {showForm && (
        <form onSubmit={save} className="mb-8 p-6 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">Novo usuário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label:'Nome', key:'name', type:'text', placeholder:'Nome completo' },
              { label:'E-mail', key:'email', type:'email', placeholder:'email@exemplo.com' },
              { label:'Senha', key:'password', type:'password', placeholder:'Senha de acesso' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">{f.label} *</label>
                <input required type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})} className={input}/>
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Função</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={input}>
                <option value="ADMIN">Admin (acesso total)</option>
                <option value="LIDER">Líder (acesso ao ministério)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480]">Ministério</label>
              <select value={form.ministerio} onChange={e => setForm({...form, ministerio: e.target.value})} className={input}>
                {MINISTERIOS.map(m => <option key={m} value={m}>{LABELS[m]}</option>)}
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
              <div className="font-display text-[1rem] text-[#f0ede8] mb-0.5">{u.name}</div>
              <div className="font-body text-[0.75rem] text-[#888480]">
                {u.email} · {u.role === 'ADMIN' ? '👑 Admin' : '🙋 Líder'} · {LABELS[u.ministerio]}
              </div>
            </div>
            <button onClick={() => del(u.id)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors shrink-0">
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
