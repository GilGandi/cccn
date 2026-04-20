import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const versicolos = [
  // João
  { texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho único, para que todo aquele que nele crê não morra, mas tenha a vida eterna.', referencia: 'João 3:16' },
  { texto: 'Deus não enviou o seu Filho ao mundo para condenar o mundo, mas para que o mundo fosse salvo por meio dele.', referencia: 'João 3:17' },
  { texto: 'Eu vim para que todos tenham vida, e a tenham plenamente.', referencia: 'João 10:10' },
  { texto: 'O bom pastor dá a sua vida pelas suas ovelhas.', referencia: 'João 10:11' },
  { texto: 'Eu sou o caminho, a verdade e a vida. Ninguém vai ao Pai se não for por mim.', referencia: 'João 14:6' },
  { texto: 'O maior amor que alguém pode ter é dar a sua vida pelos seus amigos.', referencia: 'João 15:13' },
  { texto: 'Vocês não me escolheram; fui eu que os escolhi e os designei para que vão e deem fruto, um fruto que dure sempre.', referencia: 'João 15:16' },
  { texto: 'Não os chamo mais de servos, mas de amigos, porque lhes contei tudo o que ouvi do meu Pai.', referencia: 'João 15:15' },
  { texto: 'Este é o meu mandamento: amem uns aos outros como eu os amo.', referencia: 'João 15:12' },
  { texto: 'Permaneçam unidos ao meu amor. Se vocês obedecerem aos meus mandamentos, permanecerão no meu amor.', referencia: 'João 15:9-10' },
  { texto: 'Paz eu lhes deixo; a minha paz eu dou a vocês. Não a dou como o mundo a dá. Não fiquem com o coração perturbado, nem tenham medo.', referencia: 'João 14:27' },
  { texto: 'Eu sou a ressurreição e a vida. Aquele que crê em mim, mesmo que morra, viverá.', referencia: 'João 11:25' },
  { texto: 'Como o Pai me amou, também eu amo vocês. Permaneçam no meu amor.', referencia: 'João 15:9' },
  { texto: 'Eu lhes dou a vida eterna, e elas jamais se perderão; ninguém as arrancará das minhas mãos.', referencia: 'João 10:28' },
  { texto: 'Deus amou tanto o mundo que deu o seu Filho único.', referencia: 'João 3:16' },
  { texto: 'A graça e a verdade vieram por meio de Jesus Cristo.', referencia: 'João 1:17' },
  { texto: 'Jesus lhe disse: Eu sou o pão da vida. Quem vem a mim nunca terá fome.', referencia: 'João 6:35' },
  { texto: 'Eu sou a luz do mundo. Quem me segue não andará nas trevas, mas terá a luz da vida.', referencia: 'João 8:12' },
  { texto: 'Venham a mim todos vocês que estão cansados de carregar pesadas cargas, e eu darei descanso a vocês.', referencia: 'Mateus 11:28' },
  { texto: 'Aprendam de mim, porque eu sou manso e humilde de coração, e vocês encontrarão descanso.', referencia: 'Mateus 11:29' },
  // Romanos
  { texto: 'Nada poderá nos separar do amor de Deus que está em Cristo Jesus, nosso Senhor.', referencia: 'Romanos 8:39' },
  { texto: 'Mas Deus demonstra o seu amor por nós pelo fato de Cristo ter morrido por nós quando ainda éramos pecadores.', referencia: 'Romanos 5:8' },
  { texto: 'Se Deus está do nosso lado, quem poderá estar contra nós?', referencia: 'Romanos 8:31' },
  { texto: 'Aquele que não poupou o seu próprio Filho, mas o entregou por todos nós, como não nos dará, junto com ele, todas as coisas?', referencia: 'Romanos 8:32' },
  { texto: 'Nada em todo o universo poderá nos separar do amor de Deus que está em Cristo Jesus.', referencia: 'Romanos 8:38-39' },
  { texto: 'O amor de Deus foi derramado em nossos corações pelo Espírito Santo que nos foi dado.', referencia: 'Romanos 5:5' },
  // Efésios
  { texto: 'Pois é pela graça que vocês foram salvos, por meio da fé. Isso não vem de vocês; é dom de Deus.', referencia: 'Efésios 2:8' },
  { texto: 'Deus, porém, que é rico em misericórdia, pelo grande amor com que nos amou, nos deu vida juntamente com Cristo.', referencia: 'Efésios 2:4-5' },
  { texto: 'Cristo habite nos corações de vocês pela fé. E que vocês sejam enraizados e alicerçados no amor.', referencia: 'Efésios 3:17' },
  { texto: 'Que vocês possam compreender, com todo o povo de Deus, o que é a largura, o comprimento, a altura e a profundidade do amor de Cristo.', referencia: 'Efésios 3:18' },
  // 1 João
  { texto: 'Nós amamos porque Deus nos amou primeiro.', referencia: '1 João 4:19' },
  { texto: 'Deus é amor. Aquele que vive no amor permanece em Deus, e Deus permanece nele.', referencia: '1 João 4:16' },
  { texto: 'Pois o amor que Deus tem por nós é tão grande que somos chamados filhos de Deus.', referencia: '1 João 3:1' },
  { texto: 'Foi assim que Deus demonstrou o seu amor por nós: enviou o seu Filho único ao mundo para que tivéssemos vida por meio dele.', referencia: '1 João 4:9' },
  { texto: 'O amor consiste nisto: não fomos nós que amamos a Deus, mas foi ele que nos amou e enviou o seu Filho.', referencia: '1 João 4:10' },
  { texto: 'No amor não existe medo. Ao contrário, o amor perfeito expulsa o medo.', referencia: '1 João 4:18' },
  { texto: 'Amados, amemos uns aos outros, porque o amor vem de Deus.', referencia: '1 João 4:7' },
  { texto: 'Jesus Cristo deu a sua vida por nós. Assim também devemos dar a nossa vida pelos irmãos.', referencia: '1 João 3:16' },
  // Salmos
  { texto: 'O Senhor é o meu pastor e nada me faltará.', referencia: 'Salmos 23:1' },
  { texto: 'O amor do Senhor dura para sempre, para os que o temem e obedecem às suas ordens.', referencia: 'Salmos 103:17' },
  { texto: 'O Senhor é bondoso e misericordioso, é paciente e cheio de amor.', referencia: 'Salmos 145:8' },
  { texto: 'O seu amor dura para sempre! O seu amor dura para sempre!', referencia: 'Salmos 136:1' },
  { texto: 'O Senhor apareceu a nós no passado e disse: Eu o amei com um amor eterno; por isso continuo a te tratar com bondade.', referencia: 'Jeremias 31:3' },
  { texto: 'Deus é o nosso refúgio e a nossa força, um auxílio sempre presente nas tribulações.', referencia: 'Salmos 46:1' },
  { texto: 'Guarda-me como a menina dos teus olhos; esconde-me à sombra das tuas asas.', referencia: 'Salmos 17:8' },
  { texto: 'O amor inabalável do Senhor nunca acaba! A sua misericórdia nunca cessa!', referencia: 'Lamentações 3:22' },
  // Filipenses / outros
  { texto: 'Alegrem-se sempre no Senhor! Repito: Alegrem-se!', referencia: 'Filipenses 4:4' },
  { texto: 'Tudo posso por meio de Cristo que me fortalece.', referencia: 'Filipenses 4:13' },
  { texto: 'O meu Deus suprirá todas as necessidades de vocês, segundo as suas gloriosas riquezas em Cristo Jesus.', referencia: 'Filipenses 4:19' },
  { texto: 'Não fiquem ansiosos por coisa alguma. Em tudo, porém, por meio de oração e súplica, apresentem os seus pedidos a Deus.', referencia: 'Filipenses 4:6' },
  { texto: 'A paz de Deus, que excede todo o entendimento, guardará os corações e as mentes de vocês em Cristo Jesus.', referencia: 'Filipenses 4:7' },
  // Isaías
  { texto: 'Não tema, pois estou com você. Não se apavore, pois sou o seu Deus. Eu o fortaleço, eu o auxilio.', referencia: 'Isaías 41:10' },
  { texto: 'Porque eu, o Senhor, sou o seu Deus, que o seguro pela mão direita e lhe digo: Não tenha medo; eu o ajudarei.', referencia: 'Isaías 41:13' },
  { texto: 'Pode uma mãe esquecer o bebê que está amamentando? Mas mesmo que ela se esqueça, eu jamais me esquecerei de você!', referencia: 'Isaías 49:15' },
  { texto: 'Eu os carreguei desde que nasceram, eu os carrego nos meus braços.', referencia: 'Isaías 46:3' },
  // Jeremias / Sofonias
  { texto: 'Pois eu sei os planos que tenho para você, diz o Senhor. São planos de fazê-lo prosperar e não de causar dano, planos de dar a você esperança e um futuro.', referencia: 'Jeremias 29:11' },
  { texto: 'O Senhor o seu Deus está com você, ele é poderoso e vai salvá-lo. Ele se deliciará com você com alegria, vai silenciar você com o seu amor e se alegrará por sua causa com cantos.', referencia: 'Sofonias 3:17' },
  // Mateus / Lucas / Marcos
  { texto: 'Pois bem, se vocês, apesar de serem maus, sabem dar boas coisas a seus filhos, quanto mais o Pai de vocês, que está nos céus, dará coisas boas a quem lhe pedir!', referencia: 'Mateus 7:11' },
  { texto: 'Deus amou tanto o mundo que deu o seu Filho. Quem crê nele tem a vida eterna.', referencia: 'João 3:16' },
  { texto: 'Não fiquem preocupados com a vida, com o que vão comer ou beber, nem com o corpo, com o que vão vestir. A vida não vale mais do que o alimento, e o corpo mais do que a roupa?', referencia: 'Mateus 6:25' },
  { texto: 'Procurem primeiro o Reino de Deus e o que Deus exige, e ele fornecerá também todas essas coisas.', referencia: 'Mateus 6:33' },
  { texto: 'Porque onde estiverem dois ou três reunidos em meu nome, estarei ali no meio deles.', referencia: 'Mateus 18:20' },
  { texto: 'Amarás o Senhor, o teu Deus, de todo o teu coração, de toda a tua alma e de todo o teu entendimento.', referencia: 'Mateus 22:37' },
  { texto: 'O segundo mandamento é semelhante a este: Amarás o teu próximo como a ti mesmo.', referencia: 'Mateus 22:39' },
  { texto: 'Deu-lhes este mandamento: Amem uns aos outros como eu os amo.', referencia: 'João 15:12' },
  { texto: 'Eu estarei com vocês todos os dias, até o fim do mundo.', referencia: 'Mateus 28:20' },
  { texto: 'Pois o Filho do Homem veio buscar e salvar o que estava perdido.', referencia: 'Lucas 19:10' },
  { texto: 'Nele há alegria até no céu quando um pecador se arrepende.', referencia: 'Lucas 15:7' },
  // 1 Coríntios 13
  { texto: 'O amor é paciente, o amor é bondoso. O amor não tem inveja, não se vangloria e não é orgulhoso.', referencia: '1 Coríntios 13:4' },
  { texto: 'O amor não se comporta de maneira indecorosa, não procura os seus próprios interesses, não se irrita facilmente e não guarda rancor.', referencia: '1 Coríntios 13:5' },
  { texto: 'O amor não se alegra com a injustiça, mas se alegra com a verdade.', referencia: '1 Coríntios 13:6' },
  { texto: 'O amor tudo sofre, tudo crê, tudo espera, tudo suporta. O amor nunca perece.', referencia: '1 Coríntios 13:7-8' },
  { texto: 'Agora, pois, permanecem a fé, a esperança e o amor — essas três coisas. Mas a maior delas é o amor.', referencia: '1 Coríntios 13:13' },
  // Gálatas / Colossenses / Tessalonicenses
  { texto: 'Quanto a mim, que nunca me glorie senão na cruz de nosso Senhor Jesus Cristo.', referencia: 'Gálatas 6:14' },
  { texto: 'O fruto do Espírito é: amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio.', referencia: 'Gálatas 5:22-23' },
  { texto: 'Portanto, como escolhidos de Deus, santos e amados, revistam-se de compaixão, bondade, humildade, mansidão e paciência.', referencia: 'Colossenses 3:12' },
  { texto: 'E sobre todas estas coisas ponham o amor, que é o vínculo perfeito.', referencia: 'Colossenses 3:14' },
  { texto: 'Que o Senhor dirija os seus corações para o amor de Deus e para a perseverança de Cristo.', referencia: '2 Tessalonicenses 3:5' },
  // Hebreus / Tiago / 1 Pedro
  { texto: 'Jesus Cristo é o mesmo ontem, hoje e para sempre.', referencia: 'Hebreus 13:8' },
  { texto: 'Aproximemo-nos, pois, com confiança do trono da graça, a fim de recebermos misericórdia e encontrarmos graça para nos ajudar na hora da necessidade.', referencia: 'Hebreus 4:16' },
  { texto: 'A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.', referencia: 'Hebreus 11:1' },
  { texto: 'Confiem os seus problemas a ele, porque ele cuida de vocês.', referencia: '1 Pedro 5:7' },
  { texto: 'Vocês o amam, embora nunca o tenham visto. Creem nele, embora agora não possam vê-lo.', referencia: '1 Pedro 1:8' },
  { texto: 'Vocês foram resgatados com o precioso sangue de Cristo, como de um cordeiro sem defeito e sem mancha.', referencia: '1 Pedro 1:18-19' },
  { texto: 'Deus resiste aos orgulhosos, mas dá graça aos humildes.', referencia: 'Tiago 4:6' },
  // Apocalipse / outros
  { texto: 'Eis que estou à porta e bato. Se alguém ouvir a minha voz e abrir a porta, entrarei e cearei com ele, e ele comigo.', referencia: 'Apocalipse 3:20' },
  { texto: 'Eu sou o Alfa e o Ômega, o princípio e o fim, o primeiro e o último.', referencia: 'Apocalipse 22:13' },
  { texto: 'Não se turbe o coração de vocês. Creiam em Deus; creiam também em mim.', referencia: 'João 14:1' },
  { texto: 'Na casa de meu Pai há muitas moradas. Vou preparar um lugar para vocês.', referencia: 'João 14:2' },
  { texto: 'E eu, quando for levantado da terra, atrairei todos a mim.', referencia: 'João 12:32' },
  { texto: 'Jesus disse: Eu sou o pão da vida. Aquele que vem a mim nunca terá fome, e aquele que crê em mim nunca terá sede.', referencia: 'João 6:35' },
  { texto: 'O Senhor teu Deus está contigo, ele é poderoso e vai salvá-lo.', referencia: 'Sofonias 3:17' },
  { texto: 'Deus fez tudo lindo no seu tempo certo.', referencia: 'Eclesiastes 3:11' },
  { texto: 'Porque eu, o Senhor, sou o teu Deus, que te seguro pela mão e te digo: Não tenha medo, eu te ajudarei!', referencia: 'Isaías 41:13' },
  { texto: 'Bendize ao Senhor, ó minha alma! Que tudo que há em mim bendiga o seu santo nome!', referencia: 'Salmos 103:1' },
  { texto: 'O Senhor perdoa todos os seus pecados e cura todas as suas doenças.', referencia: 'Salmos 103:3' },
  { texto: 'Assim como um pai se compadece dos seus filhos, assim o Senhor se compadece dos que o temem.', referencia: 'Salmos 103:13' },
  { texto: 'O Senhor é o teu guardião, o Senhor é a tua sombra à tua mão direita.', referencia: 'Salmos 121:5' },
  { texto: 'O Senhor guardará a tua saída e a tua entrada, desde agora e para sempre.', referencia: 'Salmos 121:8' },
  { texto: 'Amo o Senhor porque ele me ouviu, porque ele escutou o meu pedido de socorro.', referencia: 'Salmos 116:1' },
]

export async function GET() {
  const idx = Math.floor(Math.random() * versicolos.length)
  return NextResponse.json(versicolos[idx], {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
}
