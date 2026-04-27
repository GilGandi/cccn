'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'
import ErrorBox from '@/components/admin/ErrorBox'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type User   = { id: string; name: string; username: string; role: string; perfilId: string | null; perfil?: { nome: string } | null }
type Perfil = { id: string; nome: string; descricao: string | null; permissoes: string; sistema: boolean; _count?: { users: number } }

// ─── Estilos ─────────────────────────────────────────────────────────────────
const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

const ROLE_LABELS: Record<string,string> = { SUPERADMIN:'Super Admin', ADMIN:'Administrador', EDITOR:'Editor' }
const ROLE_COLORS: Record<string,string> = {
  SUPERADMIN:'text-[#c8b99a] bg-[#c8b99a]/10',
  ADMIN:'text-blue-400 bg-blue-400/10',
  EDITOR:'text-[#555] bg-white/[0.04]',
}
const ROLE_DESCS: Record<string,string> = {
  ADMIN: 'Acesso total ao sistema exceto excluir outros administradores e gerenciar Perfis.',
  EDITOR:'Gerencia conteúdo (agenda, avisos, galeria, etc.) mas não acessa Usuários nem Configurações.',
}

// ─── Permissões disponíveis para perfis ──────────────────────────────────────
const PERMISSOES_DISPONIVEIS = [
  { key:'agenda',        label:'Agenda',               desc:'Criar, editar e excluir eventos da agenda' },
  { key:'avisos',        label:'Avisos',               desc:'Gerenciar avisos exibidos no site' },
  { key:'galeria',       label:'Galeria',              desc:'Adicionar e remover fotos da galeria' },
  { key:'palavras',      label:'Palavras',             desc:'Gerenciar mensagens e ensinamentos' },
  { key:'louvor',        label:'Louvor',               desc:'Gerenciar playlists de louvor' },
  { key:'lideres',       label:'Liderança',            desc:'Gerenciar pastores e líderes' },
  { key:'inscricoes',    label:'Eventos de Inscrição', desc:'Criar eventos e gerenciar inscrições' },
  { key:'participantes', label:'Participantes',        desc:'Ver e editar cadastro global de participantes' },
  // usuarios e configuracoes e perfis são controlados pelo role, não pelo perfil customizado
]

// Permissões que o perfil Editor tem (teto máximo para perfis customizados)
const EDITOR_PERMS = new Set(['agenda','avisos','galeria','palavras','louvor','inscricoes','participantes'])

// ─── Aba: Usuários ────────────────────────────────────────────────────────────
function AbaUsuarios({ perfis, isSuperAdmin, currentUserId, currentRole }: {
  perfis: Perfil[]; isSuperAdmin: boolean; currentUserId: string; currentRole: string
}) {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'novo'|'editar'|null>(null)
  const [form, setForm]       = useState<any>({ name:'', username:'', password:'', role:'EDITOR', perfilId:'' })
  const [editId, setEditId]   = useState<string|null>(null)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/usuarios')
    if (r.ok) setUsers(await r.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo   = () => { setForm({ name:'', username:'', password:'', role:'EDITOR', perfilId:'' }); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (u: User) => { setForm({ name:u.name, username:u.username, password:'', role:u.role, perfilId:u.perfilId||'' }); setEditId(u.id); setMsg(''); setModal('editar') }

  const roleOptions = [
    { value:'EDITOR',    label:'Editor' },
    ...(isSuperAdmin ? [{ value:'ADMIN', label:'Administrador' }] : []),
  ]

  const perfilLabel = (u: User) => u.perfil?.nome || ROLE_LABELS[u.role] || u.role
  const canEdit     = (u: User) => u.id===currentUserId || isSuperAdmin || (currentRole==='ADMIN' && u.role==='EDITOR')
  const canDelete   = (u: User) => u.id!==currentUserId && u.role!=='SUPERADMIN' && (isSuperAdmin || (currentRole==='ADMIN' && u.role==='EDITOR'))

  const save = async () => {
    if (!form.name||!form.username) { setMsg('Nome e usuário são obrigatórios.'); return }
    if (modal==='novo'&&!form.password) { setMsg('Informe uma senha.'); return }
    setSaving(true); setMsg('')
    const url = editId ? `/api/usuarios/${editId}` : '/api/usuarios'
    const method = editId ? 'PUT' : 'POST'
    const body = editId
      ? { name:form.name, username:form.username, ...(form.password?{password:form.password}:{}) }
      : { name:form.name, username:form.username, password:form.password, role:form.role, perfilId:form.perfilId||null }
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    if (r.ok) { setModal(null); load() }
    else { const d=await r.json(); setMsg(d.error||'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (u: User) => {
    if (!confirm(`Excluir "${u.name}"?`)) return
    const r = await fetch(`/api/usuarios/${u.id}`, { method:'DELETE' })
    if (r.ok) load()
    else { const d=await r.json(); setMsg(d.error) }
  }

  const perfisCusts = perfis.filter(p => !p.sistema)

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo usuário
        </button>
      </div>

      {!modal && <ErrorBox error={msg} />}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
              <div className="w-9 h-9 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[0.9rem] shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-[0.88rem] text-[#f0ede8]">{u.name}</span>
                  <span className="font-body text-[0.72rem] text-[#555]">@{u.username}</span>
                  {u.id===currentUserId && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#c8b99a]/10 text-[#c8b99a]">Você</span>}
                  <span className={`font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]||ROLE_COLORS.EDITOR}`}>{perfilLabel(u)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit(u) && (
                  <button onClick={() => openEditar(u)} className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
                {canDelete(u) && (
                  <button onClick={() => del(u)} className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal==='novo'?'Novo usuário':'Editar usuário'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Nome *</label>
                <input className={inp} placeholder="Nome completo" value={form.name} autoFocus onChange={e => setForm({...form,name:e.target.value})} />
              </div>
              <div>
                <label className={lbl}>Usuário (login) *</label>
                <input className={inp} placeholder="joao.silva" value={form.username}
                  onChange={e => setForm({...form,username:e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g,'')})} />
              </div>
            </div>
            <div>
              <label className={lbl}>{modal==='editar'?'Nova senha (em branco = manter)':'Senha *'}</label>
              <input type="password" className={inp} placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => setForm({...form,password:e.target.value})} />
            </div>

            {modal==='novo' && (
              <>
                <div>
                  <label className={lbl}>Tipo de acesso</label>
                  <div className="flex flex-col gap-2">
                    {roleOptions.map(r => (
                      <label key={r.value} onClick={() => setForm({...form,role:r.value,perfilId:''})}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.role===r.value?'border-[#c8b99a]/40 bg-[#c8b99a]/[0.04]':'border-white/[0.06] hover:border-white/[0.12]'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.role===r.value?'border-[#c8b99a]':'border-white/20'}`}>
                          {form.role===r.value && <div className="w-2 h-2 rounded-full bg-[#c8b99a]" />}
                        </div>
                        <div>
                          <div className="font-body text-[0.82rem] text-[#f0ede8]">{r.label}</div>
                          <div className="font-body text-[0.65rem] text-[#555] mt-0.5">{ROLE_DESCS[r.value]}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {perfisCusts.length > 0 && (
                  <div>
                    <label className={lbl}>Perfil customizado (opcional)</label>
                    <select className={inp} value={form.perfilId} onChange={e => setForm({...form,perfilId:e.target.value})}>
                      <option value="">Usar perfil padrão do tipo</option>
                      {perfisCusts.map(p => <option key={p.id} value={p.id}>{p.nome}{p.descricao?` — ${p.descricao}`:''}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}

            <ErrorBox error={msg} />
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving?'Salvando...':modal==='novo'?'Criar usuário':'Salvar'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Aba: Perfis ──────────────────────────────────────────────────────────────
function AbaPerfis({ perfis, load, isSuperAdmin }: { perfis: Perfil[]; load: () => void; isSuperAdmin: boolean }) {
  const [modal, setModal]   = useState<'novo'|'editar'|null>(null)
  const [nome, setNome]     = useState('')
  const [desc, setDesc]     = useState('')
  const [perms, setPerms]   = useState<Record<string,boolean>>(Object.fromEntries(PERMISSOES_DISPONIVEIS.map(p=>[p.key,false])))
  const [editId, setEditId] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const openNovo = () => {
    setNome(''); setDesc('')
    // Começa com as permissões do Editor (teto máximo)
    setPerms(Object.fromEntries(PERMISSOES_DISPONIVEIS.map(p => [p.key, EDITOR_PERMS.has(p.key)])))
    setEditId(null); setMsg(''); setModal('novo')
  }

  const openEditar = (p: Perfil) => {
    setNome(p.nome); setDesc(p.descricao||'')
    const parsed = JSON.parse(p.permissoes||'{}')
    setPerms(Object.fromEntries(PERMISSOES_DISPONIVEIS.map(x => [x.key, Boolean(parsed[x.key])])))
    setEditId(p.id); setMsg(''); setModal('editar')
  }

  // Garante que uma permissão não pode ser ativada se o Editor não tem
  const togglePerm = (key: string) => {
    if (!EDITOR_PERMS.has(key)) return // Editor não tem, não pode ativar
    setPerms(prev => ({...prev, [key]: !prev[key]}))
  }

  const save = async () => {
    if (!nome.trim()) { setMsg('Nome é obrigatório.'); return }
    setSaving(true); setMsg('')
    const url = editId ? `/api/perfis/${editId}` : '/api/perfis'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify({nome,descricao:desc,permissoes:perms}) })
    if (r.ok) { setModal(null); load() }
    else { const d=await r.json(); setMsg(d.error||'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (p: Perfil) => {
    if (p.sistema) return
    if (!confirm(`Excluir o perfil "${p.nome}"?`)) return
    await fetch(`/api/perfis/${p.id}`, {method:'DELETE'})
    load()
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="font-body text-[0.78rem] text-[#555] leading-relaxed max-w-lg">
          Perfis customizados permitem permissões específicas dentro do teto do <strong className="text-[#888]">Editor</strong>. Nenhum perfil pode ter mais permissões que um Editor.
        </p>
        <button onClick={openNovo}
          className="shrink-0 px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo perfil
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {perfis.map(p => {
          const perm  = JSON.parse(p.permissoes||'{}')
          const ativas = PERMISSOES_DISPONIVEIS.filter(x => perm[x.key])
          return (
            <div key={p.id} className="bg-[#111] border border-white/[0.07] rounded-xl p-5 group hover:border-white/[0.12] transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[1rem] text-[#f0ede8]">{p.nome}</span>
                    {p.sistema && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded bg-[#c8b99a]/10 text-[#c8b99a]">Sistema</span>}
                  </div>
                  {p.descricao && <p className="font-body text-[0.75rem] text-[#555] mt-0.5">{p.descricao}</p>}
                  {p._count && <p className="font-body text-[0.65rem] text-[#444] mt-0.5">{p._count.users} usuário{p._count.users!==1?'s':''}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditar(p)} className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  {!p.sistema && (
                    <button onClick={() => del(p)} className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ativas.length===0 ? (
                  <span className="font-body text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-[#444]">Sem permissões</span>
                ) : ativas.map(a => (
                  <span key={a.key} className="font-body text-[0.58rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-[#888]">{a.label}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title={modal==='novo'?'Novo perfil':'Editar perfil'} onClose={() => setModal(null)} size="lg">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Nome *</label>
                <input className={inp} placeholder="Ex: Secretaria, Comunicação..." value={nome} autoFocus onChange={e => setNome(e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Descrição</label>
                <input className={inp} placeholder="O que este perfil pode fazer?" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={lbl + ' mb-0'}>Permissões</label>
                <span className="font-body text-[0.6rem] text-[#555]">Limitado ao teto do Editor</span>
              </div>
              <div className="flex flex-col gap-2">
                {PERMISSOES_DISPONIVEIS.map(p => {
                  const bloqueado = !EDITOR_PERMS.has(p.key)
                  return (
                    <label key={p.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${bloqueado ? 'border-white/[0.03] opacity-40 cursor-not-allowed' : 'border-white/[0.04] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]'}`}>
                      <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${perms[p.key]&&!bloqueado ? 'bg-[#c8b99a]' : 'bg-white/10'}`}
                        onClick={() => !bloqueado && togglePerm(p.key)}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${perms[p.key]&&!bloqueado ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-body text-[0.82rem] text-[#f0ede8]">{p.label}</div>
                        <div className="font-body text-[0.65rem] text-[#555]">{p.desc}{bloqueado ? ' — requer perfil Administrador ou superior' : ''}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
            <ErrorBox error={msg} />
            <div className="flex gap-2">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving?'Salvando...':modal==='novo'?'Criar perfil':'Salvar alterações'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Página principal com abas ────────────────────────────────────────────────
export default function AdminUsuarios() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id ?? ''
  const currentRole   = (session?.user as any)?.role ?? ''
  const isSuperAdmin  = currentRole === 'SUPERADMIN'

  const [aba, setAba]       = useState<'usuarios'|'perfis'>('usuarios')
  const [perfis, setPerfis] = useState<Perfil[]>([])

  const loadPerfis = async () => {
    const r = await fetch('/api/perfis')
    if (r.ok) setPerfis(await r.json())
  }
  useEffect(() => { loadPerfis() }, [])

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Usuários</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Gerencie acessos e perfis do painel</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 bg-[#111] border border-white/[0.06] rounded-lg p-1 w-fit">
        {[{k:'usuarios',l:'Usuários'},{k:'perfis',l:'Perfis'}].map(t => (
          <button key={t.k} onClick={() => setAba(t.k as any)}
            className={`px-5 py-1.5 rounded-md font-body text-[0.72rem] tracking-widest uppercase transition-all
              ${aba===t.k ? 'bg-[#1a1a1a] text-[#f0ede8] shadow-sm' : 'text-[#555] hover:text-[#888]'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {aba==='usuarios' && (
        <AbaUsuarios perfis={perfis} isSuperAdmin={isSuperAdmin} currentUserId={currentUserId} currentRole={currentRole} />
      )}
      {aba==='perfis' && (
        <AbaPerfis perfis={perfis} load={loadPerfis} isSuperAdmin={isSuperAdmin} />
      )}
    </div>
  )
}
