-- CreateTable Config
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable Lider
CREATE TABLE "Lider" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lider_pkey" PRIMARY KEY ("id")
);

-- Seed com os valores padrão da igreja
INSERT INTO "Config" ("id", "valor") VALUES
  ('nome_igreja',       'Comunidade Cristã de Campos Novos'),
  ('nome_curto',        'C.C.C.N'),
  ('subtitulo',         'Ministério Apostólico do Coração de Deus'),
  ('cidade',            'Campos Novos · Santa Catarina'),
  ('endereco',          'Rua João Gonçalves de Araújo, 829'),
  ('bairro',            'Bairro Aparecida'),
  ('cidade_estado',     'Campos Novos – SC'),
  ('cep',               '89620-000'),
  ('telefone',          '(49) 9152-9414'),
  ('telefone_link',     '+554991529414'),
  ('cnpj',              '18.702.714/0001-07'),
  ('pix_chave',         '18.702.714/0001-07'),
  ('pix_tipo',          'CNPJ'),
  ('culto_dia',         'Domingos'),
  ('culto_horario',     '19h – 21h'),
  ('instagram',         'https://instagram.com/cccnchurch'),
  ('facebook',          'https://www.facebook.com/cccnchurch/'),
  ('whatsapp',          'https://wa.me/554991529414'),
  ('ano_fundacao',      '2013'),
  ('historia_titulo',   'Ministério Apostólico do Coração de Deus'),
  ('historia_p1',       'A Comunidade Cristã de Campos Novos — C.C.C.N Ministério Apostólico do Coração de Deus — foi fundada em 2013 com o chamado de reunir famílias, jovens, homens e mulheres ao redor da Palavra de Deus e do amor genuíno.'),
  ('historia_p2',       'Localizada no Bairro Aparecida em Campos Novos, SC, a comunidade cresceu sobre a base do Evangelho, tendo como símbolo central a cruz — não apenas como ornamento, mas como declaração de fé e identidade.'),
  ('historia_p3',       'Sob a liderança do Apóstolo Vander Marcelo Kunrath, a igreja se tornou um lugar de fé, acolhimento e transformação de vidas. Nossos cultos semanais, encontros para homens, mulheres e jovens, e as células nos lares refletem nossa vocação: ser uma família que ama Deus e serve as pessoas.'),
  ('doacoes_texto',     'Sua contribuição sustenta o ministério, os cultos, os projetos sociais e a missão da Comunidade Cristã de Campos Novos. Deus vê e honra cada oferta feita com amor.'),
  ('maps_link',         'https://maps.google.com/?cid=2675944410497490917'),
  ('hero_subtitulo',    'Bem-vindo à sua família em Cristo'),
  ('home_historia',     'Fundada em 2013, somos uma família de crentes reunida em Campos Novos, SC — o C.C.C.N Ministério Apostólico do Coração de Deus — com o propósito de viver o Evangelho, amar as pessoas e transformar nossa cidade pela graça de Deus.');
