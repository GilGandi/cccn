'use client'
import { useState } from 'react'

type ErrorInput = string | null | { error?: string; detail?: string; message?: string }

interface Props {
  error: ErrorInput
  titulo?: string
}

function parseError(error: ErrorInput): { texto: string; detalhe: string | null } {
  if (!error) return { texto: '', detalhe: null }
  if (typeof error === 'string') return { texto: error, detalhe: null }
  const texto   = error.error || error.message || 'Erro desconhecido'
  const detalhe = error.detail || null
  return { texto, detalhe }
}

export default function ErrorBox({ error, titulo }: Props) {
  const [expandido, setExpandido] = useState(false)
  const [copiado, setCopiado]     = useState(false)

  const { texto, detalhe } = parseError(error)
  if (!texto) return null

  const textoCompleto = detalhe ? `${texto}\n\n${detalhe}` : texto

  const copiar = () => {
    navigator.clipboard.writeText(textoCompleto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandido(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/[0.06] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" className="text-red-400 shrink-0">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span className="font-body text-[0.82rem] text-red-400 flex-1">
          {titulo || texto}
        </span>
        {(detalhe || !titulo) && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round"
            className={`text-red-400/60 shrink-0 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </button>

      {expandido && (
        <div className="border-t border-red-500/20 px-4 pb-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-[0.58rem] tracking-widest uppercase text-red-400/60">
              Detalhes
            </span>
            <button
              type="button"
              onClick={copiar}
              className="flex items-center gap-1.5 font-body text-[0.62rem] tracking-widest uppercase text-red-400/60 hover:text-red-400 transition-colors"
            >
              {copiado ? (
                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copiado</>
              ) : (
                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar</>
              )}
            </button>
          </div>
          <textarea
            readOnly
            value={textoCompleto}
            rows={5}
            className="w-full bg-black/40 border border-red-500/20 rounded-lg px-3 py-2.5 font-mono text-[0.72rem] text-red-300/80 resize-none outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  )
}
