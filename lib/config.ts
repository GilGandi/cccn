import { prisma } from '@/lib/prisma'

// Valores padrão caso o banco não tenha a chave ainda
const DEFAULTS: Record<string, string> = {
  nome_igreja:      'Comunidade Cristã de Campos Novos',
  nome_curto:       'C.C.C.N',
  subtitulo:        'Ministério Apostólico do Coração de Deus',
  cidade:           'Campos Novos · Santa Catarina',
  endereco:         'Rua João Gonçalves de Araújo, 829',
  bairro:           'Bairro Aparecida',
  cidade_estado:    'Campos Novos – SC',
  cep:              '89620-000',
  telefone:         '(49) 9152-9414',
  telefone_link:    '+554991529414',
  cnpj:             '18.702.714/0001-07',
  pix_chave:        '18.702.714/0001-07',
  pix_tipo:         'CNPJ',
  culto_dia:        'Domingos',
  culto_horario:    '19h – 21h',
  instagram:        'https://instagram.com/cccnchurch',
  facebook:         'https://www.facebook.com/cccnchurch/',
  whatsapp:         'https://wa.me/554991529414',
  ano_fundacao:     '2013',
  historia_titulo:  'Ministério Apostólico do Coração de Deus',
  historia_p1:      'A Comunidade Cristã de Campos Novos foi fundada em 2013.',
  historia_p2:      'Localizada no Bairro Aparecida em Campos Novos, SC.',
  historia_p3:      'Um lugar de fé, acolhimento e transformação de vidas.',
  doacoes_texto:    'Sua contribuição sustenta o ministério e a missão da comunidade.',
  maps_link:        'https://maps.google.com/?cid=2675944410497490917',
  hero_subtitulo:   'Bem-vindo à sua família em Cristo',
  home_historia:    'Fundada em 2013, somos uma família de crentes reunida em Campos Novos, SC.',
}

export async function getConfigs(): Promise<Record<string, string>> {
  const rows = await prisma.config.findMany()
  const map: Record<string, string> = { ...DEFAULTS }
  for (const row of rows) map[row.id] = row.valor
  return map
}

export async function setConfig(id: string, valor: string) {
  return prisma.config.upsert({
    where: { id },
    update: { valor },
    create: { id, valor },
  })
}
