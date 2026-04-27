'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/admin/Modal'
import ErrorBox from '@/components/admin/ErrorBox'
import ImageUpload from '@/components/admin/ImageUpload'
import { safeImageSrc } from '@/lib/safeUrl'

type Evento = { id: string; titulo: string; slug: string; fotoUrl: string | null; dataEncerramento: string; ativo: boolean; vagas: number | null; _count: { inscricoes: number } }

const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

const emptyForm = {
  titulo: '', descricao: '', fotoUrl: '', dataEncerramento: '',
  datas: [] as string[], novaData: '',
  telefoneObrig: false, sexoObrig: false, idadeObrig: false,
  campoAnexoLabel: '', vagas: '', ativo: true,
}

export default function AdminEventosInscricao() {
  const [items, setItems]   = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState<'novo' | 'editar' | 'inscritos' | null>(null)
  const [form, setForm]     = useState<any>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [inscritos, setInscritos] = useState<any[]>([])
  const [eventoSel, setEventoSel] = useState<Evento | null>(null)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/eventos-inscricao')
    setItems(await r.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNovo = () => { setForm(emptyForm); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (ev: Evento) => {
    setForm({ ...emptyForm, titulo: ev.titulo, fotoUrl: ev.fotoUrl || '', dataEncerramento: ev.dataEncerramento.slice(0, 10), vagas: ev.vagas?.toString() || '', ativo: ev.ativo, campoAnexoLabel: (ev as any).campoAnexoLabel || '' })
    setEditId(ev.id); setMsg(''); setModal('editar')
  }
  const openInscritos = async (ev: Evento) => {
    setEventoSel(ev)
    const r = await fetch(`/api/eventos-inscricao/${ev.id}/inscricoes`)
    setInscritos(await r.json())
    setModal('inscritos')
  }

  const save = async () => {
    if (!form.titulo.trim() || !form.dataEncerramento) { setMsg('Título e data de encerramento são obrigatórios.'); return }
    setSaving(true); setMsg('')
    const url    = editId ? `/api/eventos-inscricao/${editId}` : '/api/eventos-inscricao'
    const method = editId ? 'PUT' : 'POST'
    const body = { ...form, vagas: form.vagas ? Number(form.vagas) : null, fotoUrl: form.fotoUrl || null }
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Excluir este evento e todas as inscrições?')) return
    await fetch(`/api/eventos-inscricao/${id}`, { method: 'DELETE' })
    load()
  }

  const delInscricao = async (iid: string, eventoId: string) => {
    if (!confirm('Remover esta inscrição?')) return
    await fetch(`/api/eventos-inscricao/${eventoId}/inscricoes/${iid}`, { method: 'DELETE' })
    if (eventoSel) openInscritos(eventoSel)
    load()
  }

  const addData = () => {
    if (!form.novaData) return
    if (form.datas.includes(form.novaData)) return
    setForm({ ...form, datas: [...form.datas, form.novaData].sort(), novaData: '' })
  }
  const removeData = (d: string) => setForm({ ...form, datas: form.datas.filter((x: string) => x !== d) })

  const hoje = new Date()

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Eventos com Inscrição</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Gerencie eventos e participantes</p>
        </div>
        <button onClick={openNovo}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
          + Novo evento
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
          <p className="font-body text-[0.85rem] text-[#444]">Nenhum evento cadastrado.</p>
          <button onClick={openNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Criar o primeiro</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(ev => {
            const enc = new Date(ev.dataEncerramento) < hoje
            const esg = ev.vagas !== null && ev._count.inscricoes >= ev.vagas
            return (
              <div key={ev.id} className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden group hover:border-white/[0.12] transition-all">
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  {safeImageSrc(ev.fotoUrl) ? (
                    <Image src={safeImageSrc(ev.fotoUrl)!} alt={ev.titulo} fill className={`object-cover ${(enc || esg) ? 'grayscale brightness-50' : ''}`} unoptimized />
                  ) : (
                    <div className="w-full h-full bg-[#0e0e0e] flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#333]" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                  )}
                  {(enc || esg) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rotate-[-20deg] border border-[#888]/40 px-4 py-1 rounded">
                        <span className="font-body text-[0.6rem] tracking-widest uppercase text-[#888]/60">{esg ? 'Esgotado' : 'Encerrado'}</span>
                      </div>
                    </div>
                  )}
                  {!ev.ativo && <div className="absolute top-2 left-2 bg-[#0a0a0a]/80 px-2 py-0.5 rounded font-body text-[0.55rem] uppercase tracking-widest text-[#555]">Inativo</div>}
                </div>
                <div className="p-4">
                  <div className="font-display text-[0.95rem] text-[#f0ede8] mb-1 truncate">{ev.titulo}</div>
                  <div className="font-body text-[0.72rem] text-[#555] mb-3">
                    Encerra {new Date(ev.dataEncerramento).toLocaleDateString('pt-BR')}
                    {ev.vagas && <span> · {ev._count.inscricoes}/{ev.vagas} vagas</span>}
                    {!ev.vagas && <span> · {ev._count.inscricoes} inscritos</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openInscritos(ev)}
                      className="flex-1 py-1.5 border border-white/[0.08] text-[#888] font-body text-[0.6rem] tracking-widest uppercase rounded hover:text-[#f0ede8] transition-all">
                      Ver inscritos
                    </button>
                    <button onClick={() => openEditar(ev)}
                      className="p-2 rounded border border-white/[0.08] text-[#555] hover:text-[#f0ede8] hover:border-white/20 transition-all">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => del(ev.id)}
                      className="p-2 rounded border border-white/[0.08] text-[#555] hover:text-red-400 hover:border-red-500/30 transition-all">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {(modal === 'novo' || modal === 'editar') && (
        <Modal title={modal === 'novo' ? 'Novo evento' : 'Editar evento'} onClose={() => setModal(null)} size="lg">
          <div className="flex flex-col gap-4">
            <ImageUpload value={form.fotoUrl} onChange={v => setForm({ ...form, fotoUrl: v })} label="Foto do evento" />
            <div>
              <label className={lbl}>Título *</label>
              <input className={inp} placeholder="Nome do evento" value={form.titulo} autoFocus
                onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Descrição</label>
              <textarea className={inp + ' resize-none'} rows={3} value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Data de encerramento das inscrições *</label>
                <input type="date" className={inp} value={form.dataEncerramento}
                  onChange={e => setForm({ ...form, dataEncerramento: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Limite de vagas (opcional)</label>
                <input type="number" className={inp} min="1" placeholder="Ilimitado" value={form.vagas}
                  onChange={e => setForm({ ...form, vagas: e.target.value })} />
              </div>
            </div>
            {/* Datas do evento */}
            <div>
              <label className={lbl}>Datas do evento</label>
              <div className="flex gap-2 mb-2">
                <input type="date" className={inp} value={form.novaData}
                  onChange={e => setForm({ ...form, novaData: e.target.value })} />
                <button type="button" onClick={addData}
                  className="px-4 py-2 border border-white/[0.08] text-[#888] font-body text-[0.7rem] uppercase rounded-md hover:text-[#f0ede8] transition-all shrink-0">
                  + Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.datas.map((d: string) => (
                  <span key={d} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c8b99a]/10 border border-[#c8b99a]/30 font-body text-[0.68rem] text-[#c8b99a]">
                    {new Date(d).toLocaleDateString('pt-BR')}
                    <button type="button" onClick={() => removeData(d)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
            {/* Campos obrigatórios */}
            <div>
              <label className={lbl}>Campos obrigatórios</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'telefoneObrig', label: 'Telefone' },
                  { key: 'sexoObrig',     label: 'Sexo' },
                  { key: 'idadeObrig',    label: 'Idade' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${form[key] ? 'bg-[#c8b99a]' : 'bg-white/10'}`}
                      onClick={() => setForm({ ...form, [key]: !form[key] })}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${form[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="font-body text-[0.75rem] text-[#888]">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Campo de anexo */}
            <div>
              <label className={lbl}>Campo de anexo (opcional)</label>
              <input className={inp} placeholder="Ex: Comprovante de pagamento, RG, Declaração..."
                value={form.campoAnexoLabel}
                onChange={e => setForm({ ...form, campoAnexoLabel: e.target.value })} />
              <p className="font-body text-[0.6rem] text-[#555] mt-1">
                Se preenchido, aparece como campo opcional no formulário de inscrição. Aceita imagem ou PDF até 5MB.
              </p>
            </div>

            {/* Ativo */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className={`w-9 h-5 rounded-full transition-colors relative ${form.ativo ? 'bg-[#c8b99a]' : 'bg-white/10'}`}
                onClick={() => setForm({ ...form, ativo: !form.ativo })}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.ativo ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="font-body text-[0.78rem] text-[#888]">Evento ativo (aceita inscrições)</span>
            </label>
            <ErrorBox error={msg} />
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Criar evento' : 'Salvar'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal inscritos */}
      {modal === 'inscritos' && eventoSel && (
        <Modal title={`Inscritos — ${eventoSel.titulo}`} onClose={() => setModal(null)} size="lg">
          <div className="flex flex-col gap-2">
            {inscritos.length === 0 && <p className="font-body text-[0.85rem] text-[#444] text-center py-8">Nenhum inscrito ainda.</p>}
            {inscritos.map((ins: any) => (
              <div key={ins.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] group">
                <div className="flex-1 min-w-0">
                  <div className="font-body text-[0.85rem] text-[#f0ede8]">{ins.participante.nome}</div>
                  <div className="font-body text-[0.72rem] text-[#555] mt-0.5">
                    {[ins.participante.telefone, ins.participante.sexo === 'M' ? 'Masc.' : ins.participante.sexo === 'F' ? 'Fem.' : null, ins.participante.idade ? `${ins.participante.idade} anos` : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <button onClick={() => delInscricao(ins.id, eventoSel.id)}
                  className="p-1.5 rounded text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all opacity-0 group-hover:opacity-100">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
