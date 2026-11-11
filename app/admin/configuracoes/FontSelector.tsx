'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Option = { key: string; label: string }

export default function FontSelector({
  options,
  current,
}: {
  options: Option[]
  current: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(current)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/font', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontKey: value }),
      })
      if (!res.ok) throw new Error()
      setStatus('saved')
      router.refresh()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Fonte do site</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full max-w-xs rounded border px-3 py-2"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <div>
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {status === 'saving' ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
      {status === 'saved' && <p className="text-sm text-green-600">Fonte salva.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Erro ao salvar.</p>}
    </div>
  )
}
