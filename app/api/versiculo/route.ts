import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIP } from '@/lib/apiAuth'

// Cache de 1 hora no CDN
export const revalidate = 3600

const versiculos = [
  { texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho único, para que todo aquele que nele crê não morra, mas tenha a vida eterna.', referencia: 'João 3:16' },
  { texto: 'Eu vim para que todos tenham vida, e a tenham plenamente.', referencia: 'João 10:10' },
  { texto: 'Eu sou o caminho, a verdade e a vida. Ninguém vai ao Pai se não for por mim.', referencia: 'João 14:6' },
  { texto: 'Paz eu lhes deixo; a minha paz eu dou a vocês. Não a dou como o mundo a dá.', referencia: 'João 14:27' },
  { texto: 'Nada poderá nos separar do amor de Deus que está em Cristo Jesus, nosso Senhor.', referencia: 'Romanos 8:39' },
  { texto: 'Venham a mim todos vocês que estão cansados de carregar pesadas cargas, e eu darei descanso a vocês.', referencia: 'Mateus 11:28' },
  { texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13' },
  { texto: 'O Senhor é o meu pastor e nada me faltará.', referencia: 'Salmos 23:1' },
  { texto: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.', referencia: 'Provérbios 3:5' },
  { texto: 'Busquem primeiro o reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês.', referencia: 'Mateus 6:33' },
]

export async function GET(req: NextRequest) {
  const ip = getClientIP(req)
  if (!rateLimit(`versiculo:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 })
  }

  const idx = Math.floor(Math.random() * versiculos.length)
  return NextResponse.json(versiculos[idx], {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
