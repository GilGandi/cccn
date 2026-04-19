'use client'
import { useState } from 'react'

export default function CopyPix() {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText('18.702.714/0001-07').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }
  return (
    <button onClick={handleCopy}
      className="self-start px-8 py-3 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.7rem] tracking-[0.18em] uppercase hover:bg-[#c8b99a] transition-colors">
      {copied ? 'Chave copiada!' : 'Copiar chave Pix'}
    </button>
  )
}
