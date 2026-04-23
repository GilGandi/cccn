export const revalidate = 600
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'
import CopyPix from '@/components/CopyPix'
import { getConfigs } from '@/lib/config'

export default async function Doacoes() {
  const cfg = await getConfigs()
  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div className="relative overflow-hidden pt-40 pb-24" style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }}>
        <WoodCross opacity={0.04} />
        <div className="relative z-10 max-w-[900px] mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Contribua</span>
            <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8] mb-6" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
              Apoie a obra<br /><em style={{ color: '#c8b99a' }}>de Deus</em>
            </h1>
            <p className="font-body font-light text-[0.95rem] leading-[1.9] text-[#888480]">{cfg.doacoes_texto}</p>
          </div>
          <div className="flex flex-col gap-5 p-8" style={{ border: '1px solid rgba(240,237,232,0.12)' }}>
            <div>
              <div className="font-body text-[0.62rem] tracking-[0.25em] uppercase text-[#c8b99a] mb-1">Chave Pix</div>
              <div className="font-display text-[1.2rem] text-[#f0ede8] break-all">{cfg.pix_chave}</div>
              <div className="font-body text-[0.73rem] text-[#888480] mt-0.5">{cfg.pix_tipo} — Transferência instantânea</div>
            </div>
            <div style={{ height: 1, background: 'rgba(240,237,232,0.12)' }} />
            <p className="font-body font-light text-[0.82rem] text-[#888480] leading-relaxed">
              Copie a chave e realize sua doação pelo aplicativo do banco. Toda contribuição é destinada integralmente ao ministério.
            </p>
            <CopyPix chave={cfg.pix_chave} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
