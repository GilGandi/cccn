'use client'
import { useEffect, useState } from 'react'

export default function VersiculoAleatorio() {
  const [versiculo, setVersiculo] = useState<{ texto: string; referencia: string } | null>(null)

  useEffect(() => {
    fetch('/api/versiculo', { cache: 'no-store' })
      .then(r => r.json())
      .then(setVersiculo)
  }, [])

  if (!versiculo) return (
    <div className="relative overflow-hidden text-center py-16 sm:py-24 px-6" style={{ borderTop: '1px solid rgba(240,237,232,0.12)', borderBottom: '1px solid rgba(240,237,232,0.12)', background: 'rgba(200,185,154,0.02)' }}>
      <div className="font-body text-[0.75rem] text-[#888480] tracking-widest uppercase animate-pulse">Carregando...</div>
    </div>
  )

  return (
    <div className="relative overflow-hidden text-center py-16 sm:py-24 px-6" style={{ borderTop: '1px solid rgba(240,237,232,0.12)', borderBottom: '1px solid rgba(240,237,232,0.12)', background: 'rgba(200,185,154,0.02)' }}>
      <p className="font-display italic text-[#f0ede8] leading-relaxed max-w-[800px] mx-auto mb-5" style={{ fontSize: 'clamp(1.4rem,4vw,2.4rem)' }}>
        "{versiculo.texto}"
      </p>
      <span className="font-body text-[0.65rem] tracking-[0.25em] uppercase text-[#c8b99a]">{versiculo.referencia}</span>
    </div>
  )
}
