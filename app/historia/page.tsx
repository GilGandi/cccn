export const revalidate = false
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'

export default function Historia() {
  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div className="relative overflow-hidden pt-40 pb-24 px-6 sm:px-10 lg:px-16 max-w-[900px] mx-auto">
        <WoodCross opacity={0.035} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Nossa História</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8] mb-10" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Ministério Apostólico<br /><em style={{ color: '#c8b99a' }}>do Coração de Deus</em>
          </h1>
          <div className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480] flex flex-col gap-6 max-w-[660px]">
            <p>A Comunidade Cristã de Campos Novos — C.C.C.N Ministério Apostólico do Coração de Deus — foi fundada em 2013 com o chamado de reunir famílias, jovens, homens e mulheres ao redor da Palavra de Deus e do amor genuíno.</p>
            <p>Localizada no Bairro Aparecida em Campos Novos, SC, a comunidade cresceu sobre a base do Evangelho, tendo como símbolo central a cruz — não apenas como ornamento, mas como declaração de fé e identidade.</p>
            <p>Sob a liderança do Apóstolo Vander Marcelo Kunrath, a igreja se tornou um lugar de fé, acolhimento e transformação de vidas. Nossos cultos semanais, encontros para homens, mulheres e jovens, e as células nos lares refletem nossa vocação: ser uma família que ama Deus e serve as pessoas.</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
