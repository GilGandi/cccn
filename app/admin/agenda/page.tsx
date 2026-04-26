'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/admin/Modal'

type Categoria = { id: string; nome: string; cor: string }
type Evento = {
  id: string; titulo: string; descricao?: string
  data: string; horario: string
  categoriaId?: string; categoria?: Categoria
}

const emptyForm = { titulo: '', descricao: '', data: '', horario: '', categoriaId: '', recorrencia: 'NENHUMA', recorrenciaFim: '' }
const inp = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"

function Badge({ label, cor }: { label: string; cor: string }) {
  return (
    <span className="inline-block font-body text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded-full"
      style={{ background: cor + '22', color: cor, border: `1px solid ${cor}44` }}>
      {label}
    </span>
  )
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DIAS  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function formatData(iso: string) {
  const d = new Date(iso)
  return { dia: d.getUTCDate(), mes: MESES[d.getUTCMonth()], dow: DIAS[d.getUTCDay()] }
}

export default function AdminAgenda() {
  const [eventos, setEventos]       = useState<Evento[]>([])
  const [cats, setCats]             = useState<Categoria[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState<'novo' | 'editar' | 'cat' | 'manutencao' | null>(null)
  const [form, setForm]             = useState<any>(emptyForm)
  const [editId, setEditId]         = useState<string | null>(null)
  const [catForm, setCatForm]       = useState({ nome: '', cor: '#c8b99a' })
  const [catEditId, setCatEditId]   = useState<string | null>(null)
  const [saving, setSaving]         = useState(false)
  const [msg, setMsg]               = useState('')
  const [filtro, setFiltro]         = useState<'proximos' | 'todos'>('proximos')
  const [mantMsg, setMantMsg]       = useState('')
  const [mantLoading, setMantLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const [ev, ct] = await Promise.all([
      fetch('/api/eventos?todos=true').then(r => r.json()),
      fetch('/api/categorias').then(r => r.json()),
    ])
    setEventos(ev); setCats(ct); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const lista = filtro === 'proximos'
    ? eventos.filter(e => new Date(e.data) >= hoje)
    : eventos

  const openNovo = () => { setForm(emptyForm); setEditId(null); setMsg(''); setModal('novo') }
  const openEditar = (e: Evento) => {
    setForm({ titulo: e.titulo, descricao: e.descricao || '', data: e.data.slice(0, 10), horario: e.horario, categoriaId: e.categoriaId || '', recorrencia: (e as any).recorrencia || 'NENHUMA', recorrenciaFim: '' })
    setEditId(e.id); setMsg(''); setModal('editar')
  }

  const saveEvento = async () => {
    if (!form.titulo || !form.data || !form.horario) { setMsg('Preencha título, data e horário.'); return }
    setSaving(true); setMsg('')
    const method = editId ? 'PUT' : 'POST'
    const url    = editId ? `/api/eventos/${editId}` : '/api/eventos'
    const r = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, categoriaId: form.categoriaId || null }),
    })
    if (r.ok) { setModal(null); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const deleteEvento = async (id: string) => {
    if (!confirm('Excluir este evento?')) return
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' })
    load()
  }

  const saveCat = async () => {
    if (!catForm.nome) { setMsg('Informe o nome.'); return }
    setSaving(true); setMsg('')
    const url    = catEditId ? `/api/categorias/${catEditId}` : '/api/categorias'
    const method = catEditId ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })
    if (r.ok) { setCatEditId(null); setCatForm({ nome: '', cor: '#c8b99a' }); load() }
    else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar.') }
    setSaving(false)
  }

  const deleteCat = async (id: string) => {
    if (!confirm('Excluir esta categoria? Eventos vinculados ficarão sem categoria.')) return
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    load()
  }

  const runManutencao = async () => {
    setMantLoading(true); setMantMsg('')
    const r = await fetch('/api/eventos/manutencao', { method: 'DELETE' })
    const d = await r.json()
    setMantMsg(d.removidos === 0
      ? 'Nenhum evento antigo encontrado.'
      : `${d.removidos} evento${d.removidos > 1 ? 's removidos' : ' removido'} com sucesso.`)
    setMantLoading(false)
    load()
  }

  // Conta eventos mais antigos que 1 mês para mostrar no botão
  const umMesAtras = new Date(); umMesAtras.setMonth(umMesAtras.getMonth() - 1)
  const qtdAntigos = eventos.filter(e => new Date(e.data) < umMesAtras).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Agenda</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Gerencie cultos e eventos</p>
        </div>
        <div className="flex gap-2">
          {qtdAntigos > 0 && (
            <button onClick={() => { setMantMsg(''); setModal('manutencao') }}
              className="px-3 py-2 border border-orange-500/30 text-orange-400 font-body text-[0.68rem] tracking-widest uppercase rounded-md hover:bg-orange-500/[0.08] transition-all flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
              Limpar ({qtdAntigos})
            </button>
          )}
          <button onClick={() => { setMsg(''); setCatEditId(null); setCatForm({ nome: '', cor: '#c8b99a' }); setModal('cat') }}
            className="px-4 py-2 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] hover:border-white/20 transition-all">
            Categorias
          </button>
          <button onClick={openNovo}
            className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
            + Evento
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-1 mb-6 bg-[#111] border border-white/[0.06] rounded-lg p-1 w-fit">
        {(['proximos', 'todos'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-md font-body text-[0.72rem] tracking-widest uppercase transition-all
              ${filtro === f ? 'bg-[#1a1a1a] text-[#f0ede8] shadow-sm' : 'text-[#555] hover:text-[#888]'}`}>
            {f === 'proximos' ? 'Próximos' : 'Todos'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-xl">
          <p className="font-body text-[0.85rem] text-[#444]">Nenhum evento encontrado.</p>
          <button onClick={openNovo} className="mt-3 font-body text-[0.75rem] text-[#c8b99a] hover:underline">Criar o primeiro evento</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {lista.map(ev => {
            const { dia, mes, dow } = formatData(ev.data)
            const passado = new Date(ev.data) < hoje
            return (
              <div key={ev.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all group
                  ${passado ? 'border-white/[0.04] bg-[#0e0e0e] opacity-60' : 'border-white/[0.07] bg-[#111] hover:border-white/[0.12]'}`}>
                <div className="shrink-0 w-12 text-center">
                  <div className="font-body text-[0.55rem] tracking-widest uppercase text-[#c8b99a]">{dow}</div>
                  <div className="font-display text-[1.5rem] text-[#f0ede8] leading-none">{dia}</div>
                  <div className="font-body text-[0.6rem] tracking-widest uppercase text-[#555]">{mes}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body text-[0.9rem] text-[#f0ede8] truncate">{ev.titulo}</span>
                    {ev.categoria && <Badge label={ev.categoria.nome} cor={ev.categoria.cor} />}
                  </div>
                  <div className="font-body text-[0.75rem] text-[#555] mt-0.5">{ev.horario}{ev.descricao ? ` · ${ev.descricao}` : ''}</div>
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditar(ev)}
                    className="p-2 rounded-lg text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => deleteEvento(ev.id)}
                    className="p-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Evento */}
      {(modal === 'novo' || modal === 'editar') && (
        <Modal title={modal === 'novo' ? 'Novo evento' : 'Editar evento'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Título *</label>
              <input className={inp} placeholder="Ex: Culto de Domingo" value={form.titulo} autoFocus
                onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Data *</label>
                <input type="date" className={inp} value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Horário *</label>
                <input type="time" className={inp} value={form.horario}
                  onChange={e => setForm({ ...form, horario: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={lbl}>Categoria</label>
              <select className={inp} value={form.categoriaId}
                onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
                <option value="">Sem categoria</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Descrição</label>
              <textarea className={inp + ' resize-none'} rows={2} placeholder="Detalhes opcionais..."
                value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Recorrência</label>
              <select className={inp} value={form.recorrencia}
                onChange={e => setForm({ ...form, recorrencia: e.target.value })}>
                <option value="NENHUMA">Sem recorrência</option>
                <option value="SEMANAL">Toda semana</option>
                <option value="QUINZENAL">A cada 2 semanas</option>
                <option value="MENSAL">Todo mês</option>
              </select>
            </div>
            {form.recorrencia !== 'NENHUMA' && (
              <div>
                <label className={lbl}>Repetir até (opcional)</label>
                <input type="date" className={inp} value={form.recorrenciaFim}
                  onChange={e => setForm({ ...form, recorrenciaFim: e.target.value })} />
                <p className="font-body text-[0.6rem] text-[#555] mt-1">Se vazio, repete por 3 meses.</p>
              </div>
            )}

            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={saveEvento} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : modal === 'novo' ? 'Criar evento' : 'Salvar alterações'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Categorias */}
      {modal === 'cat' && (
        <Modal title="Categorias" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            {/* Lista de categorias existentes */}
            {cats.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {cats.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] group">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ background: cat.cor }} />
                    <span className="font-body text-[0.85rem] text-[#f0ede8] flex-1">{cat.nome}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setCatEditId(cat.id); setCatForm({ nome: cat.nome, cor: cat.cor }); setMsg('') }}
                        className="p-1.5 rounded text-[#555] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteCat(cat.id)}
                        className="p-1.5 rounded text-[#555] hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Separador */}
            {cats.length > 0 && (
              <div className="border-t border-white/[0.06] pt-4">
                <p className="font-body text-[0.6rem] tracking-widest uppercase text-[#555] mb-3">
                  {catEditId ? 'Editar categoria' : 'Nova categoria'}
                </p>
              </div>
            )}

            {/* Formulário de criar/editar */}
            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className={lbl}>Nome *</label>
                <input className={inp} placeholder="Ex: Culto, Jovens, Kids..." value={catForm.nome}
                  onChange={e => setCatForm({ ...catForm, nome: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Cor</label>
                <input type="color" value={catForm.cor}
                  onChange={e => setCatForm({ ...catForm, cor: e.target.value })}
                  className="w-10 h-10 rounded-md border border-white/[0.08] bg-[#111] cursor-pointer p-1" />
              </div>
            </div>

            {msg && <p className="font-body text-[0.78rem] text-red-400">{msg}</p>}

            <div className="flex gap-2">
              <button onClick={saveCat} disabled={saving}
                className="flex-1 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : catEditId ? 'Salvar alterações' : 'Criar categoria'}
              </button>
              {catEditId && (
                <button onClick={() => { setCatEditId(null); setCatForm({ nome: '', cor: '#c8b99a' }); setMsg('') }}
                  className="px-4 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Manutenção */}
      {modal === 'manutencao' && (
        <Modal title="Limpeza da agenda" onClose={() => setModal(null)} size="sm">
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg bg-orange-500/[0.06] border border-orange-500/20">
              <p className="font-body text-[0.85rem] text-[#f0ede8] leading-relaxed">
                Serão removidos <strong className="text-orange-400">{qtdAntigos} evento{qtdAntigos > 1 ? 's' : ''}</strong> com data anterior a 1 mês atrás.
              </p>
              <p className="font-body text-[0.75rem] text-[#888] mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            {mantMsg && (
              <p className={`font-body text-[0.8rem] px-3 py-2 rounded-lg ${mantMsg.includes('removido') ? 'text-green-400 bg-green-500/[0.08]' : 'text-[#888] bg-white/[0.04]'}`}>
                {mantMsg}
              </p>
            )}
            {!mantMsg && (
              <div className="flex gap-2 pt-1">
                <button onClick={runManutencao} disabled={mantLoading}
                  className="flex-1 py-2.5 bg-orange-500/80 text-white font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-orange-500 transition-all disabled:opacity-50">
                  {mantLoading ? 'Removendo...' : 'Confirmar limpeza'}
                </button>
                <button onClick={() => setModal(null)}
                  className="px-5 py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                  Cancelar
                </button>
              </div>
            )}
            {mantMsg && (
              <button onClick={() => setModal(null)}
                className="w-full py-2.5 border border-white/[0.08] text-[#888] font-body text-[0.72rem] tracking-widest uppercase rounded-md hover:text-[#f0ede8] transition-all">
                Fechar
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
