'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="CCCN" width={64} height={64} className="rounded-full mb-4" />
          <h1 className="font-display text-[1.6rem] text-[#f0ede8]">Área Administrativa</h1>
          <p className="font-body text-[0.78rem] tracking-[0.15em] uppercase text-[#888480] mt-1">
            Comunidade Cristã de Campos Novos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-[#888480]">E-mail</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="seu@email.com"
              className="bg-[#111] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.9rem] px-4 py-3 outline-none focus:border-[#c8b99a] transition-colors rounded-sm placeholder:text-[#888480]/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-[#888480]">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="bg-[#111] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.9rem] px-4 py-3 outline-none focus:border-[#c8b99a] transition-colors rounded-sm placeholder:text-[#888480]/40"
            />
          </div>

          {error && (
            <p className="font-body text-[0.8rem] text-red-400 text-center">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="mt-2 py-3 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.72rem] tracking-[0.18em] uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
