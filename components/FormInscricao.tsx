'use client'
import { useState, useEffect } from 'react'
import ModalLGPD from '@/components/ModalLGPD'

interface Props {
  eventoId: string
  eventoSlug: string
  telefoneObrig: boolean
  sexoObrig: boolean
  idadeObrig: boolean
  vagasRestantes: number | null
}

const LS_KEY = 'cccn_inscricoes'

function getInscricoesSalvas(): Record<string, { inscricaoId: string; nome: string }> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveInscricao(slug: string, data: { inscricaoId: string; nome: string }) {
  const s = getInscricoesSalvas()
  s[slug] = data
  localStorage.setItem(LS_KEY, JSON.stringify(s))
}


function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ''
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

const inp = "w-full bg-[#111] border border-white/[0.08] text-[#f0ede8] font-body text-[0.9rem] px-4 py-3 rounded-md outline-none focus:border-[#c8b99a]/60 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.65rem] tracking-[0.18em] uppercase text-[#888480] mb-2"

export default function FormInscricao({ eventoId, eventoSlug, telefoneObrig, sexoObrig, idadeObrig, vagasRestantes }: Props) {
  const [nome, setNome]         = useState('')
  const [telefone, setTelefone] = useState('')
  const [sexo, setSexo]         = useState('')
  const [idade, setIdade]       = useState('')
  const [lgpdOk, setLgpdOk]     = useState(false)
  const [showLgpd, setShowLgpd] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [sucesso, setSucesso]   = useState(false)
  const [jaCadastrado, setJaCadastrado] = useState<{ nome: string } | null>(null)

  useEffect(() => {
    const s = getInscricoesSalvas()
    if (s[eventoSlug]) setJaCadastrado(s[eventoSlug])
  }, [eventoSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lgpdOk) { setMsg('Você precisa aceitar os termos de uso dos dados.'); return }
    if (vagasRestantes !== null && vagasRestantes <= 0) { setMsg('Vagas esgotadas.'); return }
    if (!nome.trim() || nome.trim().split(/\s+/).length < 2) { setMsg('Informe nome e sobrenome.'); return }

    setSaving(true); setMsg('')

    const r = await fetch(`/api/eventos-inscricao/${eventoId}/inscricoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, sexo, idade: idade ? Number(idade) : null }),
    })
    const d = await r.json()

    if (r.ok) {
      saveInscricao(eventoSlug, { inscricaoId: d.id, nome: d.participante.nome })
      setSucesso(true)
    } else {
      setMsg(d.error || 'Erro ao realizar inscrição.')
    }
    setSaving(false)
  }

  if (jaCadastrado) return (
    <div className="p-6 rounded-xl border border-[#c8b99a]/30 bg-[#c8b99a]/[0.04] text-center">
      <div className="w-12 h-12 rounded-full bg-[#c8b99a]/10 flex items-center justify-center mx-auto mb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#c8b99a]"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p className="font-display text-[1.1rem] text-[#f0ede8] mb-1">Você já está inscrito!</p>
      <p className="font-body text-[0.82rem] text-[#888480]">Inscrição realizada para <strong className="text-[#f0ede8]">{jaCadastrado.nome}</strong></p>
      <p className="font-body text-[0.7rem] text-[#555] mt-2">Seus dados estão salvos neste dispositivo.</p>
    </div>
  )

  if (sucesso) return (
    <div className="p-6 rounded-xl border border-[#c8b99a]/30 bg-[#c8b99a]/[0.04] text-center">
      <div className="w-12 h-12 rounded-full bg-[#c8b99a]/10 flex items-center justify-center mx-auto mb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#c8b99a]"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p className="font-display text-[1.2rem] text-[#f0ede8] mb-2">Inscrição confirmada!</p>
      <p className="font-body text-[0.82rem] text-[#888480]">Sua inscrição foi realizada com sucesso. Nos vemos lá!</p>
    </div>
  )

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h2 className="font-display text-[1.2rem] text-[#f0ede8]">Preencha seus dados</h2>

        <div>
          <label className={lbl}>Nome completo *</label>
          <input className={inp} placeholder="Nome e sobrenome" value={nome}
            onChange={e => setNome(e.target.value)} required />
          <p className="font-body text-[0.6rem] text-[#555] mt-1">Informe nome e sobrenome.</p>
        </div>

        <div>
          <label className={lbl}>Telefone celular {telefoneObrig ? '*' : '(opcional)'}</label>
          <input className={inp} placeholder="(49) 99999-9999" maxLength={15} value={telefone}
            onChange={e => setTelefone(mascaraTelefone(e.target.value))} />
        </div>

        <div>
          <label className={lbl}>Sexo {sexoObrig ? '*' : '(opcional)'}</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Feminino' }].map(s => (
              <button key={s.v} type="button" onClick={() => setSexo(sexo === s.v ? '' : s.v)}
                className={`py-3 rounded-md font-body text-[0.78rem] border transition-all
                  ${sexo === s.v ? 'bg-[#c8b99a]/10 border-[#c8b99a]/50 text-[#c8b99a]' : 'border-white/[0.08] text-[#555] hover:text-[#888]'}`}>
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={lbl}>Idade {idadeObrig ? '*' : '(opcional)'}</label>
          <input type="number" min="0" max="150" className={inp} placeholder="Ex: 25" value={idade}
            onChange={e => setIdade(e.target.value)} />
        </div>

        {/* Checkbox LGPD */}
        <div className={`p-4 rounded-xl border transition-all ${lgpdOk ? 'border-[#c8b99a]/30 bg-[#c8b99a]/[0.04]' : 'border-white/[0.08] bg-white/[0.02]'}`}>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div
              onClick={() => setLgpdOk(!lgpdOk)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                ${lgpdOk ? 'bg-[#c8b99a] border-[#c8b99a]' : 'border-white/20 bg-transparent'}`}>
              {lgpdOk && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </div>
            <span className="font-body text-[0.8rem] text-[#888480] leading-relaxed">
              Estou ciente que meus dados serão utilizados exclusivamente para organização interna de eventos da CCCN, em conformidade com a{' '}
              <button type="button" onClick={(e) => { e.stopPropagation(); setShowLgpd(true) }}
                className="text-[#c8b99a] hover:underline font-medium">
                Política de Privacidade (LGPD)
              </button>
              .
            </span>
          </label>
        </div>

        {msg && <p className="font-body text-[0.82rem] text-red-400 bg-red-500/[0.06] px-4 py-2.5 rounded-lg">{msg}</p>}

        <button type="submit"
          disabled={saving || !lgpdOk || (vagasRestantes !== null && vagasRestantes <= 0)}
          className="py-4 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.78rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? (
            <><span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin"/>Enviando...</>
          ) : 'Confirmar inscrição'}
        </button>
      </form>

      {showLgpd && <ModalLGPD onClose={() => setShowLgpd(false)} />}
    </>
  )
}
