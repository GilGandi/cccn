import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WoodCross from '@/components/WoodCross'

const agenda = [
  { tag: 'Culto',    tagColor: '#f0ede8', tagBorder: 'rgba(240,237,232,0.25)', day: '20', month: 'Abril · Dom', time: '19h – 21h', title: 'Culto de Celebração',  desc: 'Culto principal com toda a família da comunidade.' },
  { tag: 'Homens',   tagColor: '#7ba4d4', tagBorder: 'rgba(100,140,200,0.3)',  day: '22', month: 'Abril · Ter', time: '19h30',     title: 'Encontro de Homens',   desc: 'Noite de comunhão, palavra e oração para os homens.' },
  { tag: 'Mulheres', tagColor: '#d494a8', tagBorder: 'rgba(200,140,160,0.3)', day: '24', month: 'Abril · Qui', time: '19h30',     title: 'Encontro de Mulheres', desc: 'Um tempo especial de ministração para as mulheres.' },
  { tag: 'Jovens',   tagColor: '#8ec88e', tagBorder: 'rgba(140,200,140,0.3)', day: '27', month: 'Abril · Dom', time: '19h',       title: 'Culto de Jovens',      desc: 'Louvor, palavra e comunhão para a juventude.' },
  { tag: 'Família',  tagColor: '#c8b99a', tagBorder: 'rgba(200,185,154,0.4)', day: '04', month: 'Maio · Dom',  time: '19h',       title: 'Culto de Família',     desc: 'Celebração voltada para as famílias da comunidade.' },
  { tag: 'Células',  tagColor: '#f0ede8', tagBorder: 'rgba(240,237,232,0.2)', day: '07', month: 'Maio · Qua',  time: '20h',       title: 'Células nos Lares',    desc: 'Grupos de estudo bíblico nas casas da comunidade.' },
]

export default function Agenda() {
  return (
    <main className="bg-[#0a0a0a] text-[#f0ede8]">
      <Navbar />
      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.12)' }} className="relative overflow-hidden pt-40 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <WoodCross opacity={0.03} />
        <div className="relative z-10">
          <span className="font-body text-[0.62rem] tracking-[0.3em] uppercase text-[#c8b99a] mb-4 block">Calendário</span>
          <h1 className="font-display font-normal leading-[1.1] text-[#f0ede8]" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Agenda de <em style={{ color: '#c8b99a' }}>cultos e eventos</em>
          </h1>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ border: '1px solid rgba(240,237,232,0.12)', gap: 1, background: 'rgba(240,237,232,0.12)' }}>
          {agenda.map((item) => (
            <div key={item.day + item.month} className="relative p-6 bg-[#0a0a0a]">
              <span className="inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 mb-4"
                style={{ border: `1px solid ${item.tagBorder}`, color: item.tagColor }}>{item.tag}</span>
              <div className="absolute top-6 right-6 font-body text-[0.62rem] text-[#888480]">{item.time}</div>
              <div className="font-display text-[2rem] text-[#c8b99a] leading-none mb-1">{item.day}</div>
              <div className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#888480] mb-3">{item.month}</div>
              <div className="font-display text-[1.2rem] text-[#f0ede8] mb-1">{item.title}</div>
              <p className="font-body font-light text-[0.8rem] text-[#888480] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
