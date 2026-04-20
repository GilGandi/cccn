'use client'
import { useEffect, useState } from 'react'
import ImageUpload from '@/components/admin/ImageUpload'

type Categoria = { id: string; nome: string; cor: string; fotoUrl: string | null }
type Evento = { id: string; titulo: string; descricao: string; data: string; horario: string; categoriaId: string | null; categoria: Categoria | null; destaque: boolean }

const inp = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"
const emptyEvento = { titulo: '', descricao: '', data: '', horario: '', categoriaId: '', destaque: false }
const emptyCat = { nome: '', cor: '#c8b99a', fotoUrl: '' }
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function AdminAgenda() {
  const [eventos, setEventos]       = useState<Evento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm]             = useState<any>(emptyEvento)
  const [editing, setEditing]       = useState<string | null>(null)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [showCat, setShowCat]       = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [catForm, setCatForm]       = useState<any>(emptyCat)
  const [importForm, setImportForm] = useState({ mesOrigem: '', anoOrigem: '', mesDestino: '', anoDestino: '' })
  const [loading, setLoading]       = useState(false)
  const [msg, setMsg]               = useState('')

  const load = async () => {
    const [ev, cat] = await Promise.all([
      fetch('/api/eventos').then(r => r.json()),
      fetch('/api/categorias').then(r => r.json()),
    ])
    setEventos(Array.isArray(ev) ? ev : [])
    setCategorias(Array.isArray(cat) ? cat : [])
  }

  useEffect(() => { load() }, [])

  const saveEvento = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg('')
    const payload = { ...form, categoriaId: form.categoriaId || null }
    const res = editing
      ? await fetch(`/api/eventos/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { setMsg('Salvo com sucesso!'); setForm(emptyEvento); setEditing(null); setShowForm(false); load() }
    else { const d = await res.json(); setMsg(d.error || 'Erro ao salvar.') }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm('Deletar este evento?')) return
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' }); load()
  }

  const edit = (ev: Evento) => {
    setForm({ ...ev, data: ev.data.slice(0, 10), categoriaId: ev.categoriaId || '' })
    setEditing(ev.id); setShowForm(true); setShowCat(false); setShowImport(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const payload = { nome: catForm.nome, cor: catForm.cor, fotoUrl: catForm.fotoUrl || null }
    if (editingCat) {
      await fetch(`/api/categorias/${editingCat}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setCatForm(emptyCat); setEditingCat(null); setLoading(false); load()
  }

  const delCat = async (id: string) => {
    if (!confirm('Deletar esta categoria?')) return
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' }); load()
  }

  const editCat = (cat: Categoria) => {
    setCatForm({ nome: cat.nome, cor: cat.cor, fotoUrl: cat.fotoUrl || '' })
    setEditingCat(cat.id)
  }

  const importar = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg('')
    const res = await fetch('/api/eventos/importar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mesOrigem: +importForm.mesOrigem, anoOrigem: +importForm.anoOrigem, mesDestino: +importForm.mesDestino, anoDestino: +importForm.anoDestino }) })
    const d = await res.json()
    setMsg(`${d.importados} evento(s) importado(s) com sucesso!`)
    setShowImport(false); load(); setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Agenda</h1>
          <p className="font-body text-[0.82rem] text-[#888480]">Gerencie cultos e eventos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setShowImport(!showImport); setShowCat(false); setShowForm(false) }}
            className="px-4 py-2.5 font-body text-[0.68rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">
            Importar mês
          </button>
          <button onClick={() => { setShowCat(!showCat); setShowImport(false); setShowForm(false) }}
            className="px-4 py-2.5 font-body text-[0.68rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">
            Categorias
          </button>
          <button onClick={() => { setForm(emptyEvento); setEditing(null); setShowForm(true); setShowCat(false); setShowImport(false) }}
            className="px-4 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.68rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors">
            + Novo evento
          </button>
        </div>
      </div>

      {msg && <p className={`mb-4 font-body text-[0.82rem] px-4 py-2 rounded ${msg.includes('!') ? 'text-[#8ec88e] bg-[rgba(140,200,140,0.08)]' : 'text-red-400 bg-[rgba(255,100,100,0.08)]'}`}>{msg}</p>}

      {/* IMPORTAR */}
      {showImport && (
        <form onSubmit={importar} className="mb-6 p-5 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">Importar eventos de outro mês</h2>
          <div className="grid grid-cols-2 gap-4">
            {[['mesOrigem','Mês origem',true],['anoOrigem','Ano origem',false],['mesDestino','Mês destino',true],['anoDestino','Ano destino',false]].map(([key,label,isMes]) => (
              <div key={key as string} className="flex flex-col gap-1.5">
                <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">{label as string}</label>
                {isMes ? (
                  <select required value={(importForm as any)[key as string]} onChange={e => setImportForm({...importForm, [key as string]: e.target.value})} className={inp}>
                    <option value="">Selecione</option>
                    {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                ) : (
                  <input required type="number" placeholder={String(new Date().getFullYear())} value={(importForm as any)[key as string]} onChange={e => setImportForm({...importForm, [key as string]: e.target.value})} className={inp}/>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50">{loading ? 'Importando...' : 'Importar'}</button>
            <button type="button" onClick={() => setShowImport(false)} className="px-6 py-2.5 font-body text-[0.7rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {/* CATEGORIAS */}
      {showCat && (
        <div className="mb-6 p-5 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">Categorias</h2>
          <form onSubmit={saveCat} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Nome *</label>
                <input required value={catForm.nome} onChange={e => setCatForm({...catForm, nome: e.target.value})} className={inp} placeholder="Ex: Culto dos Homens"/>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Cor</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={catForm.cor} onChange={e => setCatForm({...catForm, cor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border border-[rgba(240,237,232,0.12)] bg-transparent"/>
                    <span className="font-body text-[0.75rem] text-[#888480]">{catForm.cor}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">URL da foto de fundo (opcional)</label>
                <input value={catForm.fotoUrl} onChange={e => setCatForm({...catForm, fotoUrl: e.target.value})} className={inp} placeholder="https://exemplo.com/foto.jpg"/>
                <p className="font-body text-[0.65rem] text-[#888480]/60">Cole o link de uma imagem. Será usada como fundo semi-transparente nos cards dos eventos desta categoria.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.68rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors shrink-0 disabled:opacity-50">
                {editingCat ? 'Salvar' : 'Adicionar'}
              </button>
              {editingCat && (
                <button type="button" onClick={() => { setCatForm(emptyCat); setEditingCat(null) }} className="px-5 py-2.5 font-body text-[0.68rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Cancelar</button>
              )}
            </div>
          </form>
          <div className="flex flex-col gap-2 mt-2">
            {categorias.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded border border-[rgba(240,237,232,0.08)] bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.cor }}/>
                  <div>
                    <span className="font-body text-[0.82rem] text-[#f0ede8]">{c.nome}</span>
                    {c.fotoUrl && <span className="font-body text-[0.65rem] text-[#888480] ml-2">· com foto</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCat(c)} className="px-2.5 py-1 font-body text-[0.62rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Editar</button>
                  <button onClick={() => delCat(c.id)} className="px-2.5 py-1 font-body text-[0.62rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM EVENTO */}
      {showForm && (
        <form onSubmit={saveEvento} className="mb-6 p-5 rounded border border-[rgba(240,237,232,0.12)] bg-[#111] flex flex-col gap-4">
          <h2 className="font-display text-[1.1rem] text-[#f0ede8]">{editing ? 'Editar evento' : 'Novo evento'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Título *</label>
              <input required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className={inp} placeholder="Nome do evento"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Categoria</label>
              <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} className={inp}>
                <option value="">Sem categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Horário *</label>
              <input required value={form.horario} onChange={e => setForm({...form, horario: e.target.value})} className={inp} placeholder="19h – 21h"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Data *</label>
              <input required type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className={inp}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">Descrição</label>
              <input value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className={inp} placeholder="Descrição opcional"/>
            </div>
          </div>
          <label className="flex items-center gap-2 font-body text-[0.8rem] text-[#888480] cursor-pointer">
            <input type="checkbox" checked={form.destaque} onChange={e => setForm({...form, destaque: e.target.checked})} className="accent-[#c8b99a]"/>
            Destacar na home
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-widests uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyEvento) }} className="px-6 py-2.5 font-body text-[0.7rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {/* LISTA */}
      <div className="flex flex-col gap-2">
        {eventos.length === 0 && <p className="font-body text-[0.85rem] text-[#888480] py-10 text-center">Nenhum evento nos próximos 6 meses.</p>}
        {eventos.map(ev => (
          <div key={ev.id} className="flex items-center justify-between p-4 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] hover:border-[rgba(240,237,232,0.16)] transition-colors gap-4">
            <div className="flex items-start gap-3">
              {ev.categoria && <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: ev.categoria.cor }}/>}
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-display text-[1rem] text-[#f0ede8]">{ev.titulo}</span>
                  {ev.categoria && <span className="font-body text-[0.58rem] tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: ev.categoria.cor + '22', color: ev.categoria.cor }}>{ev.categoria.nome}</span>}
                  {ev.destaque && <span className="font-body text-[0.55rem] tracking-widest uppercase px-2 py-0.5 bg-[rgba(200,185,154,0.15)] text-[#c8b99a] rounded">Destaque</span>}
                </div>
                <div className="font-body text-[0.75rem] text-[#888480]">{new Date(ev.data).toLocaleDateString('pt-BR')} · {ev.horario}</div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => edit(ev)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] transition-colors">Editar</button>
              <button onClick={() => del(ev.id)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors">Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
