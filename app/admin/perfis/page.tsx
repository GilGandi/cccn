'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/admin/Modal'

type Perfil = { id: string; nome: string; descricao: string | null; permissoes: string; sistema: boolean; _count?: { users: number } }

const PERMISSOES = [
  { key: 'agenda',         label: 'Agenda',                  desc: 'Criar, editar e excluir eventos da agenda' },
  { key: 'avisos',         label: 'Avisos',                  desc: 'Gerenciar avisos exibidos no site' },
  { key: 'galeria',        label: 'Galeria',                  desc: 'Adicionar e remover fotos da galeria' },
  { key: 'palavras',       label: 'Palavras',                 desc: 'Gerenciar mensagens e ensinamentos' },
  { key: 'louvor',         label: 'Louvor',                   desc: 'Gerenciar playlists de louvor' },
  { key: 'lideres',        label: 'Liderança',                desc: 'Gerenciar pastores e líderes' },
  { key: 'inscricoes',     label: 'Eventos de Inscrição',     desc: 'Criar eventos e gerenciar inscrições' },
  { key: 'participantes',  label: 'Participantes',            desc: 'Ver e editar cadastro global de participantes' },
  { key: 'usuarios',       label: 'Usuários do Sistema',      desc: 'Criar, editar e excluir usuários admin' },
  { key: 'configuracoes',  label: 'Configurações do Site',    desc: 'Editar textos, dados e configurações gerais' },
  { key: 'perfis',         label: 'Perfis e Permissões',      desc: 'Gerenciar perfis customizados (somente Super Admin)' },
]

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const emptyPerm = Object.fromEntries(PERMISSOES.map(p => [p.key, false]))

export default function AdminPerfis() {
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState<'novo' | 'editar' | null>(null)
  const [nome, setNome]     = useState('')
  const [desc, setDesc]     = useState('')
  const [perms, setPerms]   = useState<Record<string, boolean>>(emptyPerm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/perfis')
    if (r.ok) setPerfis(await r.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo = () => { setNome(''); setDesc(''); setPerms(emptyPerm); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (p: Perfil) => {
    setNome(p.nome); setDesc(p.descricao || '')
    const parsed = JSON.parse(p.permissoes || '{}')
    setPerms(Object.fromEntries(PERMISSOES.map(x => [x.key, Boolean(parsed[x.key])])))
    setEditId(p.id); setMsg(''); setModal('editar')
  }

  const save = async () => {
    if (!nome.trim()) { setMsg('Nome é obrigatório.'); return }
    setSaving(true); setMsg('')
    const url    = editId ? `/api/perfis/${editId}` : '/api/perfis'
    const method = editId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, descricao: desc, permissoes: perms }) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (p: Perfil) => {
    if (p.sistema) return
    if (!confirm(`Excluir o perfil "${p.nome}"?`)) return
    await fetch(`/api/perfis/${p.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Perfis e Permissões</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Configure o que cada tipo de usuário pode fazer</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo perfil
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {perfis.map(p => {
          const perm = JSON.parse(p.permissoes || '{}')
          const ativas = PERMISSOES.filter(x => perm[x.key])
          return (
            <div key={p.id} className="bg-[#111] border border-white/[0.07] rounded-xl p-5 group hover:border-white/[0.12] transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[1rem] text-[#f0ede8]">{p.nome}</span>
                    {p.sistema && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded bg-[#c8b99a]/10 text-[#c8b99a]">Sistema</span>}
                  </div>
                  {p.descricao && <p className="font-body text-[0.75rem] text-[#555] mt-0.5">{p.descricao}</p>}
                  {p._count && <p className="font-body text-[0.65rem] text-[#444] mt-1">{p._count.users} usuário{p._count.users !== 1 ? 's' : ''}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditar(p)}
                    className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  {!p.sistema && (
                    <button onClick={() => del(p)}
                      className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  )}
                </div>
              </div>
              {/* Permissões ativas */}
              <div className="flex flex-wrap gap-1.5">
                {ativas.length === PERMISSOES.length ? (
                  <span className="font-body text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Acesso total</span>
                ) : ativas.length === 0 ? (
                  <span className="font-body text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-[#555]">Sem permissões</span>
                ) : (
                  ativas.map(a => (
                    <span key={a.key} className="font-body text-[0.58rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-[#888]">{a.label}</span>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo perfil' : 'Editar perfil'} onClose={() => setModal(null)} size="lg">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>Nome do perfil *</label>
                <input className={inp} placeholder="Ex: Secretaria, Comunicação..." value={nome} autoFocus
                  onChange={e => setNome(e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Descrição</label>
                <input className={inp} placeholder="O que este perfil pode fazer?" value={desc}
                  onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl + ' mb-3'}>Permissões</label>
              <div className="flex flex-col gap-2">
                {PERMISSOES.map(p => (
                  <label key={p.key} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${perms[p.key] ? 'bg-[#c8b99a]' : 'bg-white/10'}`}
                      onClick={() => setPerms({ ...perms, [p.key]: !perms[p.key] })}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${perms[p.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-body text-[0.82rem] text-[#f0ede8]">{p.label}</div>
                      <div className="font-body text-[0.65rem] text-[#555]">{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Criar perfil' : 'Salvar alterações'}
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
