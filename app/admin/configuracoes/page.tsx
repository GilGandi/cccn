'use client'
import { useEffect, useState } from 'react'

const inp  = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl  = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const head = "font-display text-[1rem] text-[#f0ede8] mb-5 pb-2.5 border-b border-white/[0.06] flex items-center gap-2"

// Componente para campo individual
function Campo({ id, label, placeholder, textarea, hint, value, onChange }: {
  id: string; label: string; placeholder?: string
  textarea?: boolean; hint?: string
  value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {textarea ? (
        <textarea className={inp + ' resize-none'} rows={3}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} />
      ) : (
        <input className={inp} placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)} />
      )}
      {hint && <p className="font-body text-[0.6rem] text-[#555] mt-1">{hint}</p>}
    </div>
  )
}

// Campo duplo lado a lado
function CampoDuplo({ esq, dir, cfg, onChange }: {
  esq: { id: string; label: string; placeholder?: string; hint?: string }
  dir: { id: string; label: string; placeholder?: string; hint?: string }
  cfg: Record<string, string>; onChange: (id: string, v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Campo id={esq.id} label={esq.label} placeholder={esq.placeholder} hint={esq.hint}
        value={cfg[esq.id] ?? ''} onChange={v => onChange(esq.id, v)} />
      <Campo id={dir.id} label={dir.label} placeholder={dir.placeholder} hint={dir.hint}
        value={cfg[dir.id] ?? ''} onChange={v => onChange(dir.id, v)} />
    </div>
  )
}

function Secao({ titulo, icon, children }: { titulo: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
      <h2 className={head}>{icon}{titulo}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

const Icon = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#c8b99a] shrink-0">
    <path d={d} />
  </svg>
)

export default function AdminConfiguracoes() {
  const [cfg, setCfg]       = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => { setCfg(d); setLoaded(true) })
  }, [])

  const set = (id: string, valor: string) => setCfg(prev => ({ ...prev, [id]: valor }))
  const get = (id: string) => cfg[id] ?? ''

  const save = async () => {
    setSaving(true); setMsg('')
    const r = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    })
    setMsg(r.ok ? '✓ Salvo com sucesso!' : '✗ Erro ao salvar.')
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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Configurações</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Personalize os textos e dados do site</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`font-body text-[0.78rem] ${msg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>
          )}
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar tudo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* 1. Identidade */}
        <Secao titulo="Identidade" icon={<Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}>
          <Campo id="nome_igreja" label="Nome completo da igreja"
            placeholder="Comunidade Cristã de Campos Novos"
            value={get('nome_igreja')} onChange={v => set('nome_igreja', v)} />
          <CampoDuplo
            esq={{ id: 'nome_curto', label: 'Sigla', placeholder: 'C.C.C.N' }}
            dir={{ id: 'ano_fundacao', label: 'Ano de fundação', placeholder: '2013' }}
            cfg={cfg} onChange={set} />
          <Campo id="subtitulo" label="Subtítulo / ministério"
            placeholder="Ministério Apostólico do Coração de Deus"
            value={get('subtitulo')} onChange={v => set('subtitulo', v)} />
          <Campo id="hero_subtitulo" label="Frase de destaque (hero da home)"
            placeholder="Bem-vindo à sua família em Cristo"
            value={get('hero_subtitulo')} onChange={v => set('hero_subtitulo', v)} />
        </Secao>

        {/* 2. Localização */}
        <Secao titulo="Localização" icon={<Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />}>
          <Campo id="endereco" label="Endereço (rua e número)"
            placeholder="Rua João Gonçalves de Araújo, 829"
            value={get('endereco')} onChange={v => set('endereco', v)} />
          <CampoDuplo
            esq={{ id: 'bairro', label: 'Bairro', placeholder: 'Bairro Aparecida' }}
            dir={{ id: 'cep', label: 'CEP', placeholder: '89620-000' }}
            cfg={cfg} onChange={set} />
          <CampoDuplo
            esq={{ id: 'cidade_estado', label: 'Cidade – Estado', placeholder: 'Campos Novos – SC' }}
            dir={{ id: 'cidade', label: 'Cidade (hero / cabeçalho)', placeholder: 'Campos Novos · SC' }}
            cfg={cfg} onChange={set} />
          <Campo id="maps_link" label="Link do Google Maps"
            placeholder="https://maps.google.com/?cid=..."
            value={get('maps_link')} onChange={v => set('maps_link', v)} />
        </Secao>

        {/* 3. Contato — agrupado */}
        <Secao titulo="Contato" icon={<Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />}>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="telefone" label="Telefone (exibição no site)"
              placeholder="(49) 9152-9414" hint="Ex: (49) 9152-9414"
              value={get('telefone')} onChange={v => set('telefone', v)} />
            <Campo id="telefone_link" label="Telefone (link tel:)"
              placeholder="+554991529414" hint="Ex: +554991529414 — sem espaços"
              value={get('telefone_link')} onChange={v => set('telefone_link', v)} />
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <p className="font-body text-[0.62rem] text-[#555] mb-2 tracking-widest uppercase">Redes sociais</p>
            <div className="flex flex-col gap-3">
              <Campo id="instagram" label="Instagram"
                placeholder="https://instagram.com/cccnchurch"
                value={get('instagram')} onChange={v => set('instagram', v)} />
              <Campo id="facebook" label="Facebook"
                placeholder="https://facebook.com/cccnchurch"
                value={get('facebook')} onChange={v => set('facebook', v)} />
              <Campo id="whatsapp" label="WhatsApp (link wa.me)"
                placeholder="https://wa.me/554991529414"
                value={get('whatsapp')} onChange={v => set('whatsapp', v)} />
            </div>
          </div>
        </Secao>

        {/* 4. Cultos */}
        <Secao titulo="Cultos" icon={<Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}>
          <CampoDuplo
            esq={{ id: 'culto_dia', label: 'Dia', placeholder: 'Domingos' }}
            dir={{ id: 'culto_horario', label: 'Horário', placeholder: '19h – 21h' }}
            cfg={cfg} onChange={set} />
          <p className="font-body text-[0.7rem] text-[#555] leading-relaxed">
            Esses valores aparecem no cabeçalho da home, na seção "Como chegar", no rodapé e no arquivo .ics do Google Calendar.
          </p>
        </Secao>

        {/* 5. Doações — agrupado */}
        <Secao titulo="Doações / Pix" icon={<Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />}>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="pix_chave" label="Chave Pix"
              placeholder="18.702.714/0001-07"
              value={get('pix_chave')} onChange={v => set('pix_chave', v)} />
            <Campo id="pix_tipo" label="Tipo da chave"
              placeholder="CNPJ, CPF, e-mail, telefone..."
              hint="Exibido abaixo da chave no site"
              value={get('pix_tipo')} onChange={v => set('pix_tipo', v)} />
          </div>
          <Campo id="cnpj" label="CNPJ (para rodapé e dados legais)"
            placeholder="18.702.714/0001-07"
            hint="Aparece apenas no rodapé. Se a chave Pix for o CNPJ, preencha os dois iguais."
            value={get('cnpj')} onChange={v => set('cnpj', v)} />
          <Campo id="doacoes_texto" label="Texto explicativo da página de doações"
            placeholder="Sua contribuição sustenta o ministério..."
            textarea value={get('doacoes_texto')} onChange={v => set('doacoes_texto', v)} />
        </Secao>

        {/* 6. Nossa História — agrupado */}
        <Secao titulo="Nossa História" icon={<Icon d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />}>
          <Campo id="historia_titulo" label="Título da página"
            placeholder="Ministério Apostólico do Coração de Deus"
            value={get('historia_titulo')} onChange={v => set('historia_titulo', v)} />
          <Campo id="historia_p1" label="Parágrafo 1" textarea
            value={get('historia_p1')} onChange={v => set('historia_p1', v)} />
          <Campo id="historia_p2" label="Parágrafo 2" textarea
            value={get('historia_p2')} onChange={v => set('historia_p2', v)} />
          <Campo id="historia_p3" label="Parágrafo 3" textarea
            value={get('historia_p3')} onChange={v => set('historia_p3', v)} />
          <div className="border-t border-white/[0.06] pt-4">
            <Campo id="home_historia" label="Resumo na home (seção Nossa História)"
              hint="Texto curto exibido na página inicial — pode ser diferente dos parágrafos completos"
              textarea value={get('home_historia')} onChange={v => set('home_historia', v)} />
          </div>
        </Secao>

      </div>

      {/* Botão salvar flutuante */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3">
        {msg && (
          <span className={`font-body text-[0.78rem] px-3 py-2 rounded-lg ${msg.startsWith('✓') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {msg}
          </span>
        )}
        <button onClick={save} disabled={saving}
          className="px-5 py-3 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-xl shadow-xl hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
          {saving ? 'Salvando...' : '💾 Salvar tudo'}
        </button>
      </div>
    </div>
  )
}
