'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [attempts, setAttempts] = useState(0)
  const blocked = attempts >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (blocked) return
    setLoading(true); setError('')

    const res = await signIn('credentials', {
      username: username.toLowerCase().trim(),
      password,
      redirect: false,
    })

    if (res?.error) {
      const n = attempts + 1; setAttempts(n)
      setError(res.error.includes('tentativas') ? res.error : 'Usuário ou senha incorretos.')
      setLoading(false)
    } else {
      setSuccess(true)
      router.refresh()
      router.replace('/admin/agenda')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 transition-opacity duration-500"
      style={{ opacity: success ? 0 : 1 }}>
      <div className="w-full max-w-sm" style={{ transform: success ? 'translateY(-12px)' : 'translateY(0)', opacity: success ? 0 : 1, transition: 'all 0.5s' }}>
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="CCCN" width={64} height={64} className="rounded-full mb-4" />
          <h1 className="font-display text-[1.6rem] text-[#f0ede8]">Área Administrativa</h1>
          <p className="font-body text-[0.78rem] tracking-[0.15em] uppercase text-[#888480] mt-1">Comunidade Cristã de Campos Novos</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-[#888480]">Usuário</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              required disabled={blocked} placeholder="seu.usuario" autoComplete="username"
              className="bg-[#111] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.9rem] px-4 py-3 outline-none focus:border-[#c8b99a] transition-colors rounded-sm placeholder:text-[#888480]/40 disabled:opacity-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-[#888480]">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required disabled={blocked} placeholder="••••••••" autoComplete="current-password"
              className="bg-[#111] border border-[rgba(240,237,232,0.12)] text-[#f0ede8] font-body text-[0.9rem] px-4 py-3 outline-none focus:border-[#c8b99a] transition-colors rounded-sm placeholder:text-[#888480]/40 disabled:opacity-40" />
          </div>
          {error && <p className="font-body text-[0.8rem] text-red-400 text-center bg-red-500/[0.06] px-3 py-2 rounded-md">{error}</p>}
          <button type="submit" disabled={loading || success || blocked}
            className="mt-2 py-3 bg-[#f0ede8] text-[#0a0a0a] font-body font-medium text-[0.72rem] tracking-[0.18em] uppercase hover:bg-[#c8b99a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading || success ? (<><span className="inline-block w-3.5 h-3.5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />Entrando...</>) : blocked ? 'Aguarde antes de tentar novamente' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
