export const revalidate = 0
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import { prisma } from '@/lib/prisma'

function getEmbedUrl(rawUrl: string): { url: string; isInstagram: boolean } | null {
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'https:') return null

    if (['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtu.be', 'm.youtube.com'].includes(url.hostname)) {
      const videoId = url.hostname.includes('youtu.be')
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
      if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
        return { url: `https://www.youtube-nocookie.com/embed/${videoId}`, isInstagram: false }
      }
    }

    if (['vimeo.com', 'www.vimeo.com'].includes(url.hostname)) {
      const videoId = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1]
      if (videoId) return { url: `https://player.vimeo.com/video/${videoId}`, isInstagram: false }
    }

    if (['www.instagram.com', 'instagram.com'].includes(url.hostname)) {
      const match = url.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/)
      if (match) return { url: `https://www.instagram.com/${match[1]}/${match[2]}/embed`, isInstagram: true }
    }
  } catch {
    return null
  }
  return null
}

export default async function Palavras() {
  const palavras = await prisma.palavra.findMany({
    where: { publicado: true },
    orderBy: { data: 'desc' },
    take: 100,
  }).catch(() => [])

  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Palavras</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8] mb-6" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Palavras e <em style={{ color: '#c8b99a' }}>ensinamentos</em>
          </h1>
          <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480] max-w-[560px]">
            Mensagens e ensinamentos da Comunidade Cristã de Campos Novos.
          </p>
        </div>
      </div>

      <section aria-label="Mensagens e ensinamentos" className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        {palavras.length === 0 ? (
          <p className="font-body text-[0.95rem] text-[#888480] text-center py-16">Nenhuma palavra disponível no momento. Fique ligado!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {palavras.map((palavra) => {
              const media = palavra.videoUrl ? getEmbedUrl(palavra.videoUrl) : null
              return (
                <article key={palavra.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111]">
                  {media && (
                    <div className={`relative w-full overflow-hidden bg-black ${media.isInstagram ? 'min-h-[540px]' : ''}`} style={media.isInstagram ? undefined : { aspectRatio: '16 / 9' }}>
                      <iframe
                        src={media.url}
                        title={`${media.isInstagram ? 'Publicação do Instagram' : 'Vídeo'}: ${palavra.titulo}`}
                        className={media.isInstagram ? 'absolute inset-0 h-full w-full min-h-[540px] border-0' : 'absolute inset-0 h-full w-full border-0'}
                        loading="lazy"
                        allow="encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 font-body text-[0.65rem] tracking-[0.12em] uppercase text-[#c8b99a]">
                      {palavra.pregador && <span>{palavra.pregador}</span>}
                      <time dateTime={new Date(palavra.data).toISOString()}>{new Date(palavra.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</time>
                    </div>
                    <h2 className="font-display text-[1.35rem] leading-snug text-[#f0ede8]">{palavra.titulo}</h2>
                    {palavra.descricao && <p className="mt-3 font-body text-[0.85rem] leading-[1.8] text-[#888480] whitespace-pre-line">{palavra.descricao}</p>}
                    {palavra.videoUrl && (
                      <a href={palavra.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-body text-[0.68rem] tracking-widest uppercase text-[#c8b99a] hover:text-[#f0ede8] transition-colors">
                        {media?.isInstagram ? 'Ver no Instagram' : media ? 'Assistir no YouTube / Vimeo' : 'Abrir publicação'}
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}
