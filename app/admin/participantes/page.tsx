'use client'
import { useEffect, useState, useCallback } from 'react'
import Modal from '@/components/admin/Modal'

type Participante = { id: string; nome: string; telefone: string | null; sexo: string | null; idade: number | null; _count: { inscricoes: number } }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const empty = { nome: '', telefone: '', sexo: '', idade: '' }

export default function AdminParticipantes() {
  const [items, setItems]   = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca]   = useState('')
  const [modal, setModal]   = useState<'editar' | null>(null)
  const [form, setForm]     = useState<any>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = useCallback(async (q = '') => {
    setLoading(true)
    const r = await fetch(`/api/participantes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    setItems(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Busca com debounce
  useEffect(() => {
    const t = setTimeout(() => load(busca), 400)
    return () => clearTimeout(t)
  }, [busca, load])

  const openEditar = (p: Participante) => {
    setForm({ nome: p.nome, telefone: p.telefone || '', sexo: p.sexo || '', idade: p.idade?.toString() || '' })
    setEditId(p.id); setMsg(''); setModal('editar')
  }

  const save = async () => {
    if (!form.nome.trim() || form.nome.trim().split(' ').length < 2) { setMsg('Informe nome e sobrenome.'); return }
    setSaving(true); setMsg('')
    const r = await fetch(`/api/participantes/${editId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, idade: form.idade ? Number(form.idade) : null })
    })
    if (r.ok) { setModal(null); load(busca) }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}" e todas as suas inscrições?`)) return
    await fetch(`/api/participantes/${id}`, { method: 'DELETE' })
    load(busca)
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Participantes</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Cadastro global de participantes de eventos</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className={inp + ' pl-9'} placeholder="Buscar por nome..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : (
      <div className="flex flex-col gap-1.5">
        {items.length === 0 && <p className="text-center py-16 font-body text-[0.85rem] text-[#444]">Nenhum participante encontrado.</p>}
        {items.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#111] group hover:border-white/[0.12] transition-all">
            <div className="w-8 h-8 rounded-full bg-[#c8b99a]/10 flex items-center justify-center text-[#c8b99a] font-display text-[0.85rem] shrink-0">
              {p.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body text-[0.88rem] text-[#f0ede8]">{p.nome}</div>
              <div className="font-body text-[0.72rem] text-[#555] mt-0.5">
                {[p.telefone, p.sexo === 'M' ? 'Masc.' : p.sexo === 'F' ? 'Fem.' : null, p.idade ? `${p.idade} anos` : null].filter(Boolean).join(' · ')}
                {p._count.inscricoes > 0 && <span className="ml-2 text-[#c8b99a]">{p._count.inscricoes} evento{p._count.inscricoes > 1 ? 's' : ''}</span>}
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditar(p)}
                className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => del(p.id, p.nome)}
                className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {modal && (
        <Modal title="Editar participante" onClose={() => setModal(null)} size="sm">
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Nome completo *</label>
              <input className={inp} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Telefone</label>
                <input className={inp} value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Idade</label>
                <input type="number" className={inp} min="0" max="150" value={form.idade} onChange={e => setForm({ ...form, idade: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={lbl}>Sexo</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Feminino' }].map(s => (
                  <button key={s.v} type="button" onClick={() => setForm({ ...form, sexo: form.sexo === s.v ? '' : s.v })}
                    className={`py-2 rounded-md font-body text-[0.75rem] border transition-all ${form.sexo === s.v ? 'bg-[#c8b99a]/10 border-[#c8b99a]/50 text-[#c8b99a]' : 'border-white/[0.08] text-[#555]'}`}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar alterações'}
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
