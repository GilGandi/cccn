// Pure server component — escolhe versículo no servidor, zero fetch do cliente
const versiculos = [
  { texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho único, para que todo aquele que nele crê não morra, mas tenha a vida eterna.', referencia: 'João 3:16' },
  { texto: 'Eu vim para que todos tenham vida, e a tenham plenamente.', referencia: 'João 10:10' },
  { texto: 'Eu sou o caminho, a verdade e a vida. Ninguém vai ao Pai se não for por mim.', referencia: 'João 14:6' },
  { texto: 'O maior amor que alguém pode ter é dar a sua vida pelos seus amigos.', referencia: 'João 15:13' },
  { texto: 'Paz eu lhes deixo; a minha paz eu dou a vocês. Não a dou como o mundo a dá.', referencia: 'João 14:27' },
  { texto: 'Eu sou a ressurreição e a vida. Aquele que crê em mim, mesmo que morra, viverá.', referencia: 'João 11:25' },
  { texto: 'Nada poderá nos separar do amor de Deus que está em Cristo Jesus, nosso Senhor.', referencia: 'Romanos 8:39' },
  { texto: 'Se Deus está do nosso lado, quem poderá estar contra nós?', referencia: 'Romanos 8:31' },
  { texto: 'Venham a mim todos vocês que estão cansados de carregar pesadas cargas, e eu darei descanso a vocês.', referencia: 'Mateus 11:28' },
  { texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13' },
  { texto: 'O Senhor é o meu pastor e nada me faltará.', referencia: 'Salmos 23:1' },
  { texto: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.', referencia: 'Provérbios 3:5' },
  { texto: 'Porque sou eu que conheço os planos que tenho para vocês, planos de fazê-los prosperar e não de causar dano.', referencia: 'Jeremias 29:11' },
  { texto: 'Busquem primeiro o reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês.', referencia: 'Mateus 6:33' },
  { texto: 'Não tenham medo, pois eu estou com vocês; não se assustem, pois eu sou o seu Deus.', referencia: 'Isaías 41:10' },
]

export default function VersiculoAleatorio() {
  // Determinístico por hora — muda a cada hora mas é estável durante o revalidate
  const idx = Math.floor(Date.now() / 3_600_000) % versiculos.length
  const v = versiculos[idx]

  return (
    <div className="relative overflow-hidden text-center py-16 sm:py-24 px-6"
      style={{ borderTop: '1px solid rgba(240,237,232,0.12)', borderBottom: '1px solid rgba(240,237,232,0.12)', background: 'rgba(200,185,154,0.02)' }}>
      <p className="font-display italic text-[#f0ede8] leading-relaxed max-w-[800px] mx-auto mb-5"
        style={{ fontSize: 'clamp(1.4rem,4vw,2.4rem)' }}>
        "{v.texto}"
      </p>
      <span className="font-body text-[0.65rem] tracking-[0.25em] uppercase text-[#c8b99a]">{v.referencia}</span>
    </div>
  )
}
