export const revalidate = 300

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import { prisma } from '@/lib/prisma'

function embedUrl(url: string, tipo: string): string | null {
  if (tipo === 'spotify') {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }
  if (tipo === 'youtube') {
    const match = url.match(/[?&]list=([^&]+)/)
    if (match) return `https://www.youtube.com/embed/videoseries?list=${match[1]}`
    const vid = url.match(/(?:v=|youtu\.be\/)([^&?]+)/)
    if (vid) return `https://www.youtube.com/embed/${vid[1]}`
  }
  return null
}

export default async function Louvor() {
  const playlists = await prisma.playlist.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />

      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}
        className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Música</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Playlists de <em style={{ color: '#c8b99a' }}>louvor e adoração</em>
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-16">
        {playlists.length === 0 ? (
          <p className="font-body text-[0.95rem] text-[#888480] text-center py-20">Nenhuma playlist disponível no momento.</p>
        ) : (
          <div className="flex flex-col gap-16">
            {playlists.map(p => {
              const embed = embedUrl(p.url, p.tipo)
              return (
                <div key={p.id}>
                  <div className="flex items-center gap-3 mb-6">
                    {p.tipo === 'spotify' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-400 shrink-0">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    )}
                    {p.tipo === 'youtube' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 shrink-0">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    )}
                    <h2 className="font-display text-[1.4rem] text-[#f0ede8]">{p.titulo}</h2>
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto font-body text-[0.68rem] tracking-widest uppercase text-[#888480] hover:text-[#c8b99a] transition-colors flex items-center gap-1.5 shrink-0">
                      Abrir
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>

                  {embed ? (
                    p.tipo === 'youtube' ? (
                      /* YouTube — 16:9 responsivo */
                      <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.06]"
                        style={{ aspectRatio: '16 / 9' }}>
                        <iframe
                          src={embed}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      /* Spotify — altura fixa */
                      <iframe
                        src={embed}
                        width="100%"
                        height={380}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ borderRadius: '12px', border: '1px solid rgba(240,237,232,0.08)' }}
                      />
                    )
                  ) : (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-5 rounded-xl border border-white/[0.08] bg-[#111] hover:border-[#c8b99a]/30 transition-all">
                      <span className="font-body text-[0.85rem] text-[#c8b99a]">Abrir playlist →</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
