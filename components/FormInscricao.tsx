'use client'
import { useState, useEffect } from 'react'
import ModalLGPD from '@/components/ModalLGPD'

interface Props {
  eventoId: string
  eventoSlug: string
  telefoneObrig: boolean
  sexoObrig: boolean
  idadeObrig: boolean
  campoAnexoLabel: string | null
  enderecoObrig: boolean
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

export default function FormInscricao({ eventoId, eventoSlug, telefoneObrig, sexoObrig, idadeObrig, campoAnexoLabel, enderecoObrig, vagasRestantes }: Props) {
  const [nome, setNome]         = useState('')
  const [telefone, setTelefone] = useState('')
  const [sexo, setSexo]         = useState('')
  const [idade, setIdade]       = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero]         = useState('')
  const [bairro, setBairro]         = useState('')
  const [cidade, setCidade]         = useState('')
  const [estado, setEstado]         = useState('')
  const [lgpdOk, setLgpdOk]     = useState(false)
  const [showLgpd, setShowLgpd] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [sucesso, setSucesso]   = useState(false)
  const [anexoUrl, setAnexoUrl]   = useState('')
  const [anexoNome, setAnexoNome] = useState('')
  const [anexoEnv, setAnexoEnv]   = useState(false)
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

    // Upload do anexo se fornecido
    let anexoUrlFinal = anexoUrl || null
    if (campoAnexoLabel && anexoEnv && !anexoUrl) { setMsg('Envie o arquivo antes de confirmar.'); setSaving(false); return }

    const r = await fetch(`/api/eventos-inscricao/${eventoId}/inscricoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, sexo, idade: idade ? Number(idade) : null, logradouro, numero, bairro, cidade, estado, anexoUrl: anexoUrlFinal }),
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

        {/* Campo de Anexo */}
        {campoAnexoLabel && (
          <div>
            <label className={lbl}>{campoAnexoLabel} (opcional)</label>
            {!anexoUrl ? (
              <div>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 5 * 1024 * 1024) { setMsg('Arquivo muito grande. Máximo 5MB.'); return }
                    setAnexoEnv(true); setMsg('')
                    const fd = new FormData(); fd.append('file', file)
                    const r = await fetch(`/api/upload-inscricao?eventoId=${eventoId}`, { method: 'POST', body: fd })
                    const d = await r.json()
                    if (r.ok) { setAnexoUrl(d.url); setAnexoNome(file.name) }
                    else { setMsg(d.error || 'Erro no upload.'); setAnexoEnv(false) }
                  }}
                  className="w-full font-body text-[0.82rem] text-[#888480] file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#c8b99a]/10 file:text-[#c8b99a] file:font-body file:text-[0.68rem] file:tracking-widest file:uppercase hover:file:bg-[#c8b99a]/20 cursor-pointer" />
                <p className="font-body text-[0.6rem] text-[#555] mt-1">JPEG, PNG, WebP ou PDF · máx. 5MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#c8b99a]/[0.06] border border-[#c8b99a]/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#c8b99a] shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="font-body text-[0.78rem] text-[#f0ede8] flex-1 truncate">{anexoNome}</span>
                <button type="button" onClick={() => { setAnexoUrl(''); setAnexoNome(''); setAnexoEnv(false) }}
                  className="font-body text-[0.65rem] text-[#555] hover:text-red-400 transition-colors">Remover</button>
              </div>
            )}
          </div>
        )}

        {/* Endereço */}
        <div className="flex flex-col gap-4">
          <div>
            <label className={lbl}>Telefone *</label>
            <input className={inp} placeholder="(49) 99999-9999" maxLength={15} value={telefone}
              onChange={e => setTelefone(mascaraTelefone(e.target.value))} />
          </div>
          {enderecoObrig && (
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col gap-3">
              <p className="font-body text-[0.62rem] tracking-widest uppercase text-[#888480]">Endereço {enderecoObrig ? '*' : '(opcional)'}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={lbl}>Logradouro</label>
                  <input className={inp} placeholder="Rua, Av..." value={logradouro} onChange={e => setLogradouro(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Número</label>
                  <input className={inp} placeholder="123" value={numero} onChange={e => setNumero(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Bairro</label>
                <input className={inp} placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Cidade</label>
                  <input className={inp} placeholder="Campos Novos" value={cidade} onChange={e => setCidade(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Estado</label>
                  <input className={inp} placeholder="SC" maxLength={2} value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} />
                </div>
              </div>
            </div>
          )}
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
