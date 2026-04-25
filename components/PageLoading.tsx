import Image from 'next/image'

export default function PageLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo com pulse */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#c8b99a]/10 animate-ping" style={{ animationDuration: '2s' }} />
          <Image src="/logo.png" alt="Carregando" width={56} height={56} className="rounded-full relative z-10 opacity-80" />
        </div>
        {/* Barra de loading minimalista */}
        <div className="w-24 h-px bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-[#c8b99a]/60 rounded-full animate-loading-bar" />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0%   { width: 0%; margin-left: 0% }
          50%  { width: 60%; margin-left: 20% }
          100% { width: 0%; margin-left: 100% }
        }
        .animate-loading-bar { animation: loading-bar 1.2s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.3s ease both; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}
