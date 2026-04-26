'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  eventoId: string
  eventoSlug: string
  telefoneObrig: boolean
  sexoObrig: boolean
  idadeObrig: boolean
  vagasRestantes: number | null
}

const LS_KEY = 'cccn_inscricoes'

function getInscricoesSalvas(): Record<string, { inscricaoId: string; participanteId: string; nome: string }> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveInscricao(eventoSlug: string, data: { inscricaoId: string; participanteId: string; nome: string }) {
  const salvas = getInscricoesSalvas()
  salvas[eventoSlug] = data
  localStorage.setItem(LS_KEY, JSON.stringify(salvas))
}

const inp = "w-full bg-[#111] border border-white/[0.08] text-[#f0ede8] font-body text-[0.9rem] px-4 py-3 rounded-md outline-none focus:border-[#c8b99a]/60 transition-colors placeholder:text-[#444]"
const lbl = "block font-body text-[0.65rem] tracking-[0.18em] uppercase text-[#888480] mb-2"

export default function FormInscricao({ eventoId, eventoSlug, telefoneObrig, sexoObrig, idadeObrig, vagasRestantes }: Props) {
  const [nome, setNome]         = useState('')
  const [telefone, setTelefone] = useState('')
  const [sexo, setSexo]         = useState('')
  const [idade, setIdade]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [sucesso, setSucesso]   = useState(false)
  const [jaCadastrado, setJaCadastrado] = useState<{ nome: string } | null>(null)

  // Autocomplete
  const [sugestoes, setSugestoes]     = useState<any[]>([])
  const [showSug, setShowSug]         = useState(false)
  const [selectedPart, setSelectedPart] = useState<any | null>(null)
  const debounceRef = useRef<any>(null)

  // Verificar se já está inscrito (localStorage)
  useEffect(() => {
    const salvas = getInscricoesSalvas()
    if (salvas[eventoSlug]) setJaCadastrado(salvas[eventoSlug])
  }, [eventoSlug])

  // Buscar sugestões ao digitar nome
  const handleNomeChange = (v: string) => {
    setNome(v); setSelectedPart(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.length < 3) { setSugestoes([]); setShowSug(false); return }
    debounceRef.current = setTimeout(async () => {
      const r = await fetch(`/api/participantes/busca?q=${encodeURIComponent(v)}`)
      if (r.ok) {
        const data = await r.json()
        setSugestoes(data)
        setShowSug(data.length > 0)
      }
    }, 300)
  }

  const selectSugestao = (p: any) => {
    // Apenas id e nome vêm do servidor público — dados pessoais o usuário preenche
    setSelectedPart(p)
    setNome(p.nome)
    // Limpa campos para o usuário confirmar/corrigir seus dados
    setTelefone('')
    setSexo('')
    setIdade('')
    setSugestoes([]); setShowSug(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (vagasRestantes !== null && vagasRestantes <= 0) { setMsg('Vagas esgotadas.'); return }
    setSaving(true); setMsg('')

    // Envia participanteId para reutilizar cadastro existente
    // + dados atualizados (que podem ter mudado desde o último evento)
    const body = selectedPart
      ? {
          participanteId: selectedPart.id,
          // Atualiza dados se o usuário preencheu
          ...(telefone ? { telefone } : {}),
          ...(sexo ? { sexo } : {}),
          ...(idade ? { idade: Number(idade) } : {}),
        }
      : { nome, telefone, sexo, idade: idade ? Number(idade) : null }

    const r = await fetch(`/api/eventos-inscricao/${eventoId}/inscricoes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    const d = await r.json()
    if (r.ok) {
      saveInscricao(eventoSlug, { inscricaoId: d.id, participanteId: d.participanteId, nome: d.participante.nome })
      setSucesso(true)
    } else {
      setMsg(d.error || 'Erro ao realizar inscrição.')
    }
    setSaving(false)
  }

  if (jaCadastrado) return (
    <div className="p-6 rounded-xl border border-[#c8b99a]/30 bg-[#c8b99a]/[0.04] text-center">
      <div className="text-2xl mb-3">✓</div>
      <p className="font-display text-[1.1rem] text-[#f0ede8] mb-1">Você já está inscrito!</p>
      <p className="font-body text-[0.82rem] text-[#888480]">Inscrição realizada para <strong className="text-[#f0ede8]">{jaCadastrado.nome}</strong></p>
    </div>
  )

  if (sucesso) return (
    <div className="p-6 rounded-xl border border-[#c8b99a]/30 bg-[#c8b99a]/[0.04] text-center animate-fade-in">
      <div className="text-2xl mb-3">✓</div>
      <p className="font-display text-[1.2rem] text-[#f0ede8] mb-2">Inscrição confirmada!</p>
      <p className="font-body text-[0.82rem] text-[#888480]">Sua inscrição foi realizada com sucesso. Nos vemos lá!</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="font-display text-[1.2rem] text-[#f0ede8]">Preencha seus dados</h2>

      {/* Nome com autocomplete */}
      <div className="relative">
        <label className={lbl}>Nome completo *</label>
        <input className={inp} placeholder="Nome e sobrenome" value={nome}
          onChange={e => handleNomeChange(e.target.value)}
          onBlur={() => setTimeout(() => setShowSug(false), 200)} />
        {showSug && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#181818] border border-white/[0.08] rounded-lg overflow-hidden shadow-xl">
            {sugestoes.map(p => (
              <button key={p.id} type="button"
                className="w-full text-left px-4 py-3 font-body text-[0.85rem] text-[#f0ede8] hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-0"
                onClick={() => selectSugestao(p)}>
                <div>{p.nome}</div>
                <div className="text-[0.7rem] text-[#555] mt-0.5">{[p.telefone, p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Feminino' : null, p.idade ? `${p.idade} anos` : null].filter(Boolean).join(' · ')}</div>
              </button>
            ))}
          </div>
        )}
        {selectedPart && (
          <p className="font-body text-[0.65rem] text-[#c8b99a] mt-1">✓ Dados preenchidos automaticamente</p>
        )}
      </div>

      {/* Campos sempre visíveis — dados pessoais nunca vêm do servidor público */}
      {true && (
        <>
          {/* Telefone */}
          <div>
            <label className={lbl}>Telefone celular {telefoneObrig ? '*' : '(opcional)'}</label>
            <input className={inp} placeholder="(49) 99999-9999" value={telefone}
              onChange={e => setTelefone(e.target.value)} />
          </div>

          {/* Sexo */}
          <div>
            <label className={lbl}>Sexo {sexoObrig ? '*' : '(opcional)'}</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Feminino' }].map(s => (
                <button key={s.v} type="button" onClick={() => setSexo(sexo === s.v ? '' : s.v)}
                  className={`py-3 rounded-md font-body text-[0.78rem] border transition-all ${sexo === s.v ? 'bg-[#c8b99a]/10 border-[#c8b99a]/50 text-[#c8b99a]' : 'border-white/[0.08] text-[#555] hover:text-[#888]'}`}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Idade */}
          <div>
            <label className={lbl}>Idade {idadeObrig ? '*' : '(opcional)'}</label>
            <input type="number" min="0" max="150" className={inp} placeholder="Ex: 25" value={idade}
              onChange={e => setIdade(e.target.value)} />
          </div>
        </>
      )}

      {msg && <p className="font-body text-[0.82rem] text-red-400 bg-red-500/[0.06] px-4 py-2.5 rounded-lg">{msg}</p>}

      <button type="submit" disabled={saving || (vagasRestantes !== null && vagasRestantes <= 0)}
        className="py-4 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.78rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? (<><span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin"/>Enviando...</>) : 'Confirmar inscrição'}
      </button>
    </form>
  )
}
