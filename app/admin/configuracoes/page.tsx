'use client'
import { useEffect, useState } from 'react'

const inp  = "w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50 transition-colors placeholder:text-[#444]"
const lbl  = "block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5"
const head = "font-display text-[1rem] text-[#f0ede8] mb-5 pb-2.5 border-b border-white/[0.06] flex items-center gap-2"

const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}h`)

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

function Secao({ titulo, icon, children }: { titulo: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
      <h2 className={head}>
        <span className="text-[#c8b99a] text-[1rem]">{icon}</span>
        {titulo}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// Converte telefone bruto para link tel: ex: "(49) 9152-9414" → "+554991529414"
function telParaLink(tel: string): string {
  return '+55' + tel.replace(/\D/g, '')
}

// Converte lista de dias para exibição: ['Domingo'] → 'Domingos', ['Domingo','Quarta'] → 'Domingos e Quartas'
function diasParaExibicao(dias: string[]): string {
  if (!dias.length) return ''
  const plurais = dias.map(d => d + 's')
  if (plurais.length === 1) return plurais[0]
  return plurais.slice(0, -1).join(', ') + ' e ' + plurais[plurais.length - 1]
}

export default function AdminConfiguracoes() {
  const [cfg, setCfg]       = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [loaded, setLoaded] = useState(false)
  // Dias selecionados (armazenados como JSON no campo culto_dia)
  const [diasSel, setDiasSel] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then((d: Record<string, string>) => {
      setCfg(d)
      // Tenta parsear culto_dia como JSON, senão trata como string legada
      try {
        const parsed = JSON.parse(d.culto_dia || '[]')
        setDiasSel(Array.isArray(parsed) ? parsed : [d.culto_dia])
      } catch {
        // legado: "Domingos" → ["Domingo"]
        const legado = (d.culto_dia || '').replace(/s$/, '')
        setDiasSel(DIAS_SEMANA.includes(legado) ? [legado] : [])
      }
      setLoaded(true)
    })
  }, [])

  const set = (id: string, valor: string) => setCfg(prev => ({ ...prev, [id]: valor }))
  const get = (id: string) => cfg[id] ?? ''

  // Ao mudar telefone, recalcula o link tel: e whatsapp automaticamente
  const setTelefone = (tel: string) => {
    const link = telParaLink(tel)
    setCfg(prev => ({
      ...prev,
      telefone: tel,
      telefone_link: link,
      whatsapp: `https://wa.me/${link.replace('+', '')}`,
    }))
  }

  // Ao mudar cidade_estado, sincroniza cidade (hero)
  const setCidade = (v: string) => {
    setCfg(prev => ({ ...prev, cidade_estado: v, cidade: v }))
  }

  // Toggle de dia da semana
  const toggleDia = (dia: string) => {
    const novos = diasSel.includes(dia)
      ? diasSel.filter(d => d !== dia)
      : [...diasSel, dia].sort((a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b))
    setDiasSel(novos)
    // Salva como JSON no campo culto_dia para uso interno
    // e como texto legível no campo culto_dia_exibicao
    setCfg(prev => ({
      ...prev,
      culto_dia: JSON.stringify(novos),
      culto_dia_exibicao: diasParaExibicao(novos),
    }))
  }

  // Hora de início do culto
  const setHora = (h: string) => set('culto_horario', h)

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
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-[1.8rem] text-[#f0ede8] leading-tight">Configurações</h1>
          <p className="font-body text-[0.8rem] text-[#555] mt-1">Personalize os textos e dados do site</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className={`font-body text-[0.78rem] ${msg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>}
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar tudo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Identidade */}
        <Secao titulo="Identidade" icon="⛪">
          <Campo id="nome_igreja" label="Nome completo"
            placeholder="Comunidade Cristã de Campos Novos"
            value={get('nome_igreja')} onChange={v => set('nome_igreja', v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="nome_curto" label="Sigla" placeholder="C.C.C.N"
              value={get('nome_curto')} onChange={v => set('nome_curto', v)} />
            <Campo id="ano_fundacao" label="Ano de fundação" placeholder="2013"
              value={get('ano_fundacao')} onChange={v => set('ano_fundacao', v)} />
          </div>
          <Campo id="subtitulo" label="Subtítulo / ministério"
            placeholder="Ministério Apostólico do Coração de Deus"
            value={get('subtitulo')} onChange={v => set('subtitulo', v)} />
          <Campo id="hero_subtitulo" label="Frase de destaque (hero da home)"
            placeholder="Bem-vindo à sua família em Cristo"
            value={get('hero_subtitulo')} onChange={v => set('hero_subtitulo', v)} />
        </Secao>

        {/* Localização */}
        <Secao titulo="Localização" icon="📍">
          <Campo id="endereco" label="Endereço"
            placeholder="Rua João Gonçalves de Araújo, 829"
            value={get('endereco')} onChange={v => set('endereco', v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="bairro" label="Bairro" placeholder="Bairro Aparecida"
              value={get('bairro')} onChange={v => set('bairro', v)} />
            <Campo id="cep" label="CEP" placeholder="89620-000"
              value={get('cep')} onChange={v => set('cep', v)} />
          </div>
          {/* cidade_estado e cidade sincronizados */}
          <div>
            <label className={lbl}>Cidade – Estado</label>
            <input className={inp} placeholder="Campos Novos – SC"
              value={get('cidade_estado')}
              onChange={e => setCidade(e.target.value)} />
            <p className="font-body text-[0.6rem] text-[#555] mt-1">
              Usado no endereço e no cabeçalho do site simultaneamente.
            </p>
          </div>
          <Campo id="maps_link" label="Link do Google Maps"
            placeholder="https://maps.google.com/?cid=..."
            value={get('maps_link')} onChange={v => set('maps_link', v)} />
        </Secao>

        {/* Contato */}
        <Secao titulo="Contato e Redes" icon="📞">
          <div>
            <label className={lbl}>Telefone</label>
            <input className={inp} placeholder="(49) 9152-9414"
              value={get('telefone')}
              onChange={e => setTelefone(e.target.value)} />
            <p className="font-body text-[0.6rem] text-[#555] mt-1">
              O link <code className="text-[#c8b99a]">tel:</code> e o link do WhatsApp são gerados automaticamente.
              {get('whatsapp') && <span className="ml-1 text-[#888]">WhatsApp: {get('whatsapp')}</span>}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Instagram</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-white/[0.04] border border-r-0 border-white/[0.08] rounded-l-md font-body text-[0.78rem] text-[#555]">instagram.com/</span>
                <input className={inp + ' rounded-l-none'} placeholder="cccnchurch"
                  value={get('instagram_handle')}
                  onChange={e => {
                    const h = e.target.value.replace(/[^a-zA-Z0-9._]/g, '')
                    set('instagram_handle', h)
                    set('instagram', `https://instagram.com/${h}`)
                  }} />
              </div>
            </div>
            <div>
              <label className={lbl}>Facebook</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-white/[0.04] border border-r-0 border-white/[0.08] rounded-l-md font-body text-[0.78rem] text-[#555]">facebook.com/</span>
                <input className={inp + ' rounded-l-none'} placeholder="cccnchurch"
                  value={get('facebook_handle')}
                  onChange={e => {
                    const h = e.target.value.replace(/[^a-zA-Z0-9._]/g, '')
                    set('facebook_handle', h)
                    set('facebook', `https://facebook.com/${h}`)
                  }} />
              </div>
            </div>
          </div>
        </Secao>

        {/* Cultos */}
        <Secao titulo="Cultos" icon="🕊️">
          {/* Dias da semana */}
          <div>
            <label className={lbl}>Dias do culto</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DIAS_SEMANA.map(dia => (
                <button key={dia} type="button" onClick={() => toggleDia(dia)}
                  className={`px-3 py-1.5 rounded-md font-body text-[0.72rem] tracking-wide border transition-all
                    ${diasSel.includes(dia)
                      ? 'bg-[#c8b99a]/15 border-[#c8b99a]/50 text-[#c8b99a]'
                      : 'border-white/[0.08] text-[#555] hover:text-[#888] hover:border-white/20'
                    }`}>
                  {dia}
                </button>
              ))}
            </div>
            {diasSel.length > 0 && (
              <p className="font-body text-[0.6rem] text-[#555] mt-2">
                Exibição: <span className="text-[#888]">{diasParaExibicao(diasSel)}</span>
              </p>
            )}
          </div>

          {/* Horário — select de hora */}
          <div>
            <label className={lbl}>Hora de início</label>
            <select className={inp} value={get('culto_horario')} onChange={e => setHora(e.target.value)}>
              <option value="">Selecione...</option>
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <p className="font-body text-[0.6rem] text-[#555] mt-1">
              Horário de término não é exibido pois varia.
            </p>
          </div>
        </Secao>

        {/* Doações */}
        <Secao titulo="Doações / Pix" icon="💰">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="pix_tipo" label="Tipo da chave Pix"
              placeholder="CNPJ, CPF, e-mail, telefone..."
              value={get('pix_tipo')} onChange={v => set('pix_tipo', v)} />
            <Campo id="pix_chave" label="Chave Pix"
              placeholder="18.702.714/0001-07"
              value={get('pix_chave')} onChange={v => set('pix_chave', v)} />
          </div>
          <Campo id="cnpj" label="CNPJ (rodapé e dados legais)"
            placeholder="18.702.714/0001-07"
            hint="Se a chave Pix for o CNPJ, preencha os dois iguais."
            value={get('cnpj')} onChange={v => set('cnpj', v)} />
          <Campo id="doacoes_texto" label="Texto explicativo" textarea
            placeholder="Sua contribuição sustenta o ministério..."
            value={get('doacoes_texto')} onChange={v => set('doacoes_texto', v)} />
        </Secao>

        {/* Nossa História */}
        <Secao titulo="Nossa História" icon="📖">
          <Campo id="historia_titulo" label="Título da página"
            placeholder="Ministério Apostólico do Coração de Deus"
            value={get('historia_titulo')} onChange={v => set('historia_titulo', v)} />

          {/* Parágrafos como um textarea só, separados por linha em branco */}
          <div>
            <label className={lbl}>Texto completo</label>
            <textarea className={inp + ' resize-y'} rows={10}
              placeholder={'Parágrafo 1...\n\nParágrafo 2...\n\nParágrafo 3...'}
              value={[get('historia_p1'), get('historia_p2'), get('historia_p3')].filter(Boolean).join('\n\n')}
              onChange={e => {
                // Divide por linhas em branco e salva nos 3 campos individuais
                const partes = e.target.value.split(/\n\s*\n/)
                set('historia_p1', partes[0]?.trim() || '')
                set('historia_p2', partes[1]?.trim() || '')
                set('historia_p3', partes[2]?.trim() || '')
              }}
            />
            <p className="font-body text-[0.6rem] text-[#555] mt-1">
              Separe os parágrafos com uma linha em branco.
            </p>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <Campo id="home_historia" label="Resumo na home"
              hint="Texto curto exibido na página inicial."
              textarea value={get('home_historia')} onChange={v => set('home_historia', v)} />
          </div>
          <div className="border-t border-white/[0.06] pt-4">
            <p className={lbl + ' mb-3'}>3 pilares (cards da seção Nossa História)</p>
            <div className="flex flex-col gap-3">
              {[1,2,3].map(n => (
                <div key={n} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <div>
                    <label className={lbl}>Título {n}</label>
                    <input className={inp} placeholder={['Fé','Família','Missão'][n-1]}
                      value={get(`home_card${n}_titulo`)}
                      onChange={e => set(`home_card${n}_titulo`, e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Descrição {n}</label>
                    <input className={inp} placeholder="Descrição breve..."
                      value={get(`home_card${n}_desc`)}
                      onChange={e => set(`home_card${n}_desc`, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Secao>

      </div>

      {/* Salvar flutuante */}
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
