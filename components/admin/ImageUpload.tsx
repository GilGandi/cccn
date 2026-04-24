'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB — igual ao servidor

export default function ImageUpload({ value, onChange, label = 'Foto de fundo' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    // Validação client-side (UX — servidor valida de novo)
    if (!ALLOWED_MIMES.includes(file.type)) {
      setError('Tipo inválido. Use JPG, PNG, WebP ou GIF.')
      return
    }
    if (file.size === 0) {
      setError('Arquivo vazio.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Imagem muito grande. Máximo 10MB.')
      return
    }

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) onChange(data.url)
      else setError(data.error || 'Erro ao fazer upload.')
    } catch {
      setError('Erro de rede no upload.')
    } finally {
      setUploading(false)
      // Reseta o input para permitir re-upload do mesmo arquivo após erro
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  // Só exibe o preview se for URL do Cloudinary (confiável)
  const safePreview = value && value.startsWith('https://res.cloudinary.com/') ? value : ''

  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-[0.6rem] tracking-widest uppercase text-[#888480]">{label}</label>

      {safePreview && (
        <div className="relative w-full h-28 rounded overflow-hidden border border-[rgba(240,237,232,0.12)]">
          <Image src={safePreview} alt="Preview" fill className="object-cover" unoptimized />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-[#0a0a0a]/80 text-[#f0ede8] text-[0.7rem] rounded flex items-center justify-center hover:bg-red-900 transition-colors">
            ✕
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept={ALLOWED_MIMES.join(',')} onChange={handleFile} className="hidden" />

      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
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
      <p className="font-body text-[0.62rem] text-[#888480]/50">JPG, PNG, WebP ou GIF · máx. 10MB</p>
    </div>
  )
}
