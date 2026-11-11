'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FONT_OPTIONS } from '@/lib/font-options'

export default function FontSelector() {
  const router = useRouter()
  const [value, setValue] = useState('default')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/admin/font')
      .then(r => r.json())
      .then(d => { if (d.fontKey) setValue(d.fontKey) })
      .catch(() => {})
  }, [])

  async function save() {
    setStatus('saving')
    const r = await fetch('/api/admin/font', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fontKey: value }),
    })
    if (r.ok) {
      setStatus('saved')
      router.refresh()
    } else {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div>
      <label className="block font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#666] mb-1.5">
        Fonte do site
      </label>
      <select
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-white/[0.08] text-[#f0ede8] font-body text-[0.85rem] px-3 py-2.5 rounded-md outline-none focus:border-[#c8b99a]/50"
      >
        {FONT_OPTIONS.map(o => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-4 py-2 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] disabled:opacity-50"
        >
          {status === 'saving' ? 'Salvando...' : 'Aplicar fonte'}
        </button>
        {status === 'saved' && <span className="font-body text-[0.78rem] text-green-400">✓ Fonte aplicada</span>}
        {status === 'error' && <span className="font-body text-[0.78rem] text-red-400">✗ Erro ao salvar</span>}
      </div>
      <p className="font-body text-[0.6rem] text-[#555] mt-2">
        Vale para o site inteiro e é salvo separadamente do botão "Salvar tudo".
      </p>
    </div>
  )
}
