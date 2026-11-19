'use client'
import Image from 'next/image'
import { safeImageSrc } from '@/lib/safeUrl'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Foto de fundo' }: Props) {
  const safePreview = safeImageSrc(value)

  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-[0.6rem] uppercase tracking-widest text-[#888480]">{label}</label>
      {safePreview && (
        <div className="relative h-28 w-full overflow-hidden rounded border border-[rgba(240,237,232,0.12)]">
          <Image src={safePreview} alt="Prévia da imagem" fill className="object-cover" unoptimized />
          <button type="button" onClick={() => onChange('')} aria-label="Remover imagem" className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded bg-[#0a0a0a]/80 text-[0.7rem] text-[#f0ede8] transition-colors hover:bg-red-900">×</button>
        </div>
      )}
      <input
        type="url"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="https://…"
        aria-label={`URL de ${label.toLowerCase()}`}
        className="w-full rounded-md border border-[rgba(240,237,232,0.12)] bg-[#0f0f0f] px-3 py-2.5 font-body text-[0.8rem] text-[#f0ede8] outline-none transition-colors placeholder:text-[#666] focus:border-[#c8b99a]"
      />
      <p className="font-body text-[0.62rem] text-[#888480]/70">Cole uma URL HTTPS acessível publicamente. O upload de arquivos não está habilitado.</p>
    </div>
  )
}
