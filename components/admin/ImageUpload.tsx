'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Foto de fundo' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 5MB.')
      return
    }

    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()

    if (res.ok) {
      onChange(data.url)
    } else {
      setError(data.error || 'Erro ao fazer upload.')
    }
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">{label}</label>

      {value && (
        <div className="relative w-full h-28 rounded overflow-hidden border border-[rgba(240,237,232,0.12)]">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-[#0a0a0a]/80 text-[#f0ede8] text-[0.7rem] rounded flex items-center justify-center hover:bg-red-900 transition-colors">
            ✕
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 px-4 py-2.5 font-body text-[0.68rem] tracking-widest uppercase text-[#888480] border border-[rgba(240,237,232,0.12)] hover:text-[#f0ede8] hover:border-[#c8b99a] transition-colors disabled:opacity-50">
        {uploading ? (
          <>
            <span className="w-3 h-3 border border-[#c8b99a] border-t-transparent rounded-full animate-spin"/>
            Enviando...
          </>
        ) : (
          <>{value ? '↑ Trocar foto' : '↑ Enviar foto'}</>
        )}
      </button>

      {error && <p className="font-body text-[0.72rem] text-red-400">{error}</p>}
      <p className="font-body text-[0.62rem] text-[#888480]/50">JPG, PNG ou WEBP · máx. 5MB</p>
    </div>
  )
}
