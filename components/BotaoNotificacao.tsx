'use client'
import { useEffect, useState } from 'react'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}

export default function BotaoNotificacao() {
  const [estado, setEstado] = useState<'idle'|'inscrito'|'negado'|'indisponivel'|'carregando'>('carregando')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC) {
      setEstado('indisponivel')
      return
    }
    const perm = Notification.permission
    if (perm === 'denied') { setEstado('negado'); return }

    // Verificar se já tem subscription ativa
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setEstado(sub ? 'inscrito' : 'idle')
      })
    })

    // Registrar service worker
    navigator.serviceWorker.register('/sw.js').catch(() => setEstado('indisponivel'))
  }, [])

  const inscrever = async () => {
    if (!VAPID_PUBLIC) return
    setEstado('carregando')
    try {
      const reg  = await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setEstado('negado'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setEstado('inscrito')
    } catch {
      setEstado('idle')
    }
  }

  const cancelar = async () => {
    setEstado('carregando')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setEstado('idle')
    } catch {
      setEstado('inscrito')
    }
  }

  if (estado === 'indisponivel' || estado === 'negado') return null
  if (estado === 'carregando') return (
    <div className="w-8 h-8 border-2 border-[#c8b99a]/20 border-t-[#c8b99a]/60 rounded-full animate-spin" />
  )

  if (estado === 'inscrito') return (
    <button onClick={cancelar} title="Cancelar notificações da agenda"
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#c8b99a]/40 bg-[#c8b99a]/10 text-[#c8b99a] font-body text-[0.68rem] tracking-widest uppercase transition-all hover:bg-[#c8b99a]/20">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
      Notificações ativas
    </button>
  )

  return (
    <button onClick={inscrever} title="Receber lembretes dos eventos"
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.12] text-[#888480] font-body text-[0.68rem] tracking-widest uppercase transition-all hover:border-[#c8b99a]/40 hover:text-[#c8b99a]">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      Receber lembretes
    </button>
  )
}
