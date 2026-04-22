'use client'
import { useEffect } from 'react'

export default function Modal({ title, onClose, children, size = 'md' }: {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  // Fechar com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" />
      <div
        className={`relative z-10 w-full ${maxW} bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl max-h-[90vh] flex flex-col`}
        style={{ animation: 'modalIn 0.18s ease both' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h2 className="font-display text-[1rem] text-[#f0ede8]">{title}</h2>
          <button onClick={onClose} className="text-[#555] hover:text-[#f0ede8] transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(6px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  )
}
