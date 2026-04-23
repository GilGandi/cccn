'use client'
import { useEffect, useState } from 'react'

const inp  = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl  = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const head = "font-display text-[1rem] text-[#f0ede8] mb-4 pb-2 border-b border-white/[0.06]"

const SECOES = [
  {
    titulo: 'Identidade da Igreja',
    campos: [
      { id: 'nome_igreja',   label: 'Nome completo',    placeholder: 'Comunidade Cristã de Campos Novos' },
      { id: 'nome_curto',    label: 'Sigla / nome curto', placeholder: 'C.C.C.N' },
      { id: 'subtitulo',     label: 'Subtítulo',        placeholder: 'Ministério Apostólico do Coração de Deus' },
      { id: 'ano_fundacao',  label: 'Ano de fundação',  placeholder: '2013' },
    ]
  },
  {
    titulo: 'Contato e Localização',
    campos: [
      { id: 'telefone',      label: 'Telefone (exibição)', placeholder: '(49) 9152-9414' },
      { id: 'telefone_link', label: 'Telefone (link tel:)', placeholder: '+554991529414' },
      { id: 'endereco',      label: 'Endereço',           placeholder: 'Rua João Gonçalves de Araújo, 829' },
      { id: 'bairro',        label: 'Bairro',             placeholder: 'Bairro Aparecida' },
      { id: 'cidade_estado', label: 'Cidade – Estado',    placeholder: 'Campos Novos – SC' },
      { id: 'cidade',        label: 'Cidade (hero)',       placeholder: 'Campos Novos · Santa Catarina' },
      { id: 'cep',           label: 'CEP',                placeholder: '89620-000' },
      { id: 'maps_link',     label: 'Link Google Maps',   placeholder: 'https://maps.google.com/...' },
    ]
  },
  {
    titulo: 'Cultos',
    campos: [
      { id: 'culto_dia',     label: 'Dia do culto',    placeholder: 'Domingos' },
      { id: 'culto_horario', label: 'Horário',         placeholder: '19h – 21h' },
    ]
  },
  {
    titulo: 'Doações / Pix',
    campos: [
      { id: 'cnpj',          label: 'CNPJ',            placeholder: '18.702.714/0001-07' },
      { id: 'pix_chave',     label: 'Chave Pix',       placeholder: '18.702.714/0001-07' },
      { id: 'pix_tipo',      label: 'Tipo da chave',   placeholder: 'CNPJ' },
      { id: 'doacoes_texto', label: 'Texto da página de doações', placeholder: 'Sua contribuição...', textarea: true },
    ]
  },
  {
    titulo: 'Redes Sociais',
    campos: [
      { id: 'instagram', label: 'Instagram (URL completa)', placeholder: 'https://instagram.com/cccnchurch' },
      { id: 'facebook',  label: 'Facebook (URL completa)',  placeholder: 'https://facebook.com/...' },
      { id: 'whatsapp',  label: 'WhatsApp (link wa.me)',    placeholder: 'https://wa.me/554991529414' },
    ]
  },
  {
    titulo: 'Textos da Home',
    campos: [
      { id: 'hero_subtitulo', label: 'Frase do hero',    placeholder: 'Bem-vindo à sua família em Cristo' },
      { id: 'home_historia',  label: 'Texto "Nossa História" (home)', placeholder: 'Fundada em 2013...', textarea: true },
    ]
  },
  {
    titulo: 'Nossa História (página completa)',
    campos: [
      { id: 'historia_titulo', label: 'Título', placeholder: 'Ministério Apostólico do Coração de Deus' },
      { id: 'historia_p1',     label: 'Parágrafo 1', placeholder: '', textarea: true },
      { id: 'historia_p2',     label: 'Parágrafo 2', placeholder: '', textarea: true },
      { id: 'historia_p3',     label: 'Parágrafo 3', placeholder: '', textarea: true },
    ]
  },
]

export default function AdminConfiguracoes() {
  const [cfg, setCfg]     = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]     = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => { setCfg(d); setLoaded(true) })
  }, [])

  const save = async () => {
    setSaving(true); setMsg('')
    const r = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    })
    setMsg(r.ok ? 'Salvo com sucesso!' : 'Erro ao salvar.')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (!loaded) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Configurações</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Personalize os textos e dados do site</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`font-body text-[0.78rem] ${msg.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>
          )}
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar tudo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {SECOES.map(secao => (
          <div key={secao.titulo} className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
            <h2 className={head}>{secao.titulo}</h2>
            <div className="flex flex-col gap-4">
              {secao.campos.map(campo => (
                <div key={campo.id}>
                  <label className={lbl}>{campo.label}</label>
                  {(campo as any).textarea ? (
                    <textarea
                      className={inp + ' resize-none'} rows={3}
                      placeholder={campo.placeholder}
                      value={cfg[campo.id] ?? ''}
                      onChange={e => setCfg({ ...cfg, [campo.id]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inp}
                      placeholder={campo.placeholder}
                      value={cfg[campo.id] ?? ''}
                      onChange={e => setCfg({ ...cfg, [campo.id]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão salvar flutuante */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3">
        {msg && (
          <span className={`font-body text-[0.78rem] px-3 py-2 rounded-lg ${msg.includes('sucesso') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>{msg}</span>
        )}
        <button onClick={save} disabled={saving}
          className="px-5 py-3 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-xl shadow-xl hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
          {saving ? 'Salvando...' : '💾 Salvar tudo'}
        </button>
      </div>
    </div>
  )
}
