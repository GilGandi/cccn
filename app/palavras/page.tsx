import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'

export default function Palavras() {
  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div className="relative overflow-hidden pt-40 pb-24 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Palavras</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8] mb-8" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Palavras e <em style={{ color: '#c8b99a' }}>ensinamentos</em>
          </h1>
          <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480] max-w-[560px]">
            Em breve você poderá acessar aqui as mensagens e ensinamentos da Comunidade Cristã de Campos Novos. Fique ligado!
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
