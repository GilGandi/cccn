-- Adicionar username e perfilId ao User, manter email como fallback temporário
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "perfilId" TEXT;

-- Preencher username com base no email (parte antes do @) para usuários existentes
UPDATE "User" SET "username" = split_part(email, '@', 1) WHERE "username" IS NULL;

-- Tornar username obrigatório e único
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Criar tabela de Perfis
CREATE TABLE IF NOT EXISTS "Perfil" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "permissoes" TEXT NOT NULL DEFAULT '{}',
    "sistema" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Perfil_nome_key" ON "Perfil"("nome");

-- Seed: perfis de sistema (não deletáveis)
INSERT INTO "Perfil" ("id", "nome", "descricao", "permissoes", "sistema", "updatedAt") VALUES
  ('perfil_superadmin', 'Super Admin', 'Acesso total ao sistema. Não pode ser excluído.', '{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":true,"usuarios":true,"configuracoes":true,"perfis":true,"inscricoes":true,"participantes":true}', true, NOW()),
  ('perfil_admin', 'Administrador', 'Acesso total exceto gerenciar Super Admins e Perfis do sistema.', '{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":true,"usuarios":true,"configuracoes":true,"perfis":false,"inscricoes":true,"participantes":true}', true, NOW()),
  ('perfil_editor', 'Editor', 'Gerencia conteúdo. Não acessa Usuários (exceto próprio perfil) nem Configurações.', '{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":false,"usuarios":false,"configuracoes":false,"perfis":false,"inscricoes":true,"participantes":true}', true, NOW())
ON CONFLICT ("nome") DO NOTHING;

-- Vincular usuários SUPERADMIN ao perfil Super Admin
UPDATE "User" SET "perfilId" = 'perfil_superadmin' WHERE "role" = 'SUPERADMIN' AND "perfilId" IS NULL;
UPDATE "User" SET "perfilId" = 'perfil_admin'      WHERE "role" = 'ADMIN'      AND "perfilId" IS NULL;
UPDATE "User" SET "perfilId" = 'perfil_editor'     WHERE "role" = 'EDITOR'     AND "perfilId" IS NULL;

-- Foreign key
ALTER TABLE "User" ADD CONSTRAINT IF NOT EXISTS "User_perfilId_fkey"
  FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Participantes
CREATE TABLE IF NOT EXISTS "Participante" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "sexo" TEXT,
    "idade" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- Eventos de inscrição
CREATE TABLE IF NOT EXISTS "EventoInscricao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "slug" TEXT NOT NULL,
    "telefoneObrig" BOOLEAN NOT NULL DEFAULT false,
    "sexoObrig" BOOLEAN NOT NULL DEFAULT false,
    "idadeObrig" BOOLEAN NOT NULL DEFAULT false,
    "datas" TEXT NOT NULL DEFAULT '[]',
    "dataEncerramento" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "vagas" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventoInscricao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventoInscricao_slug_key" ON "EventoInscricao"("slug");

-- Inscrições
CREATE TABLE IF NOT EXISTS "Inscricao" (
    "id" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Inscricao_participanteId_eventoId_key"
  ON "Inscricao"("participanteId", "eventoId");

ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_participanteId_fkey"
  FOREIGN KEY ("participanteId") REFERENCES "Participante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_eventoId_fkey"
  FOREIGN KEY ("eventoId") REFERENCES "EventoInscricao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
