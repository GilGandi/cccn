'use client'
import { useEffect, useState } from 'react'

type Aviso = { id: string; texto: string; ativo: boolean; createdAt: string }
const input = "bg-[#0a0a0a] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 outline-none focus:border-[#c8b99a] transition-colors rounded-sm w-full placeholder:text-[#888480]/40"

export default function AdminAvisos() {
  const [items, setItems]   = useState<Aviso[]>([])
  const [texto, setTexto]   = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const r = await fetch('/api/avisos')
    setItems(await r.json())
  }

  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    await fetch('/api/avisos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ texto, ativo: true }) })
    setTexto(''); setLoading(false); load()
  }

  const toggle = async (id: string, ativo: boolean) => {
    await fetch(`/api/avisos/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ativo: !ativo }) })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Deletar este aviso?')) return
    await fetch(`/api/avisos/${id}`, { method:'DELETE' })
    load()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Avisos</h1>
        <p className="font-body text-[0.82rem] text-[#888480]">Avisos rápidos exibidos no site</p>
      </div>

      <form onSubmit={add} className="mb-8 flex gap-3">
        <textarea
          required value={texto} onChange={e => setTexto(e.target.value)}
          className={input + ' resize-none flex-1'} rows={2}
          placeholder="Digite o aviso para a comunidade..."/>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 self-end bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-widest uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50 shrink-0">
          {loading ? '...' : 'Publicar'}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="font-body text-[0.85rem] text-[#888480] py-10 text-center">Nenhum aviso ativo.</p>
        )}
        {items.map(a => (
          <div key={a.id} className="flex items-center justify-between p-4 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] gap-4">
            <p className="font-body text-[0.88rem] text-[#f0ede8] flex-1 leading-relaxed">{a.texto}</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggle(a.id, a.ativo)}
                className={`px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase border transition-colors
                  ${a.ativo ? 'text-[#8ec88e] border-[rgba(140,200,140,0.2)] hover:bg-[rgba(140,200,140,0.08)]' : 'text-[#888480] border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8]'}`}>
                {a.ativo ? 'Ativo' : 'Inativo'}
              </button>
              <button onClick={() => del(a.id)} className="px-3 py-1.5 font-body text-[0.65rem] tracking-widest uppercase text-red-400 border border-[rgba(255,100,100,0.2)] hover:bg-[rgba(255,100,100,0.08)] transition-colors">
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
