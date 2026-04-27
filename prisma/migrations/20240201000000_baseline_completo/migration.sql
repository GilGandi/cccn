-- ============================================================
-- Migration baseline completa — estado atual do banco
-- Todas as migrations anteriores foram consolidadas aqui
-- ============================================================

-- Enums
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN','COLABORADOR','SUPERADMIN','EDITOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "Recorrencia" AS ENUM ('NENHUMA','SEMANAL','QUINZENAL','MENSAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Garantir novos valores no enum Role
DO $$ BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR'; EXCEPTION WHEN others THEN NULL; END $$;

-- Migrar roles antigos
DO $$ BEGIN
  EXECUTE 'UPDATE "User" SET "role" = ''SUPERADMIN''::text::"Role" WHERE "role"::text = ''ADMIN''';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  EXECUTE 'UPDATE "User" SET "role" = ''EDITOR''::text::"Role" WHERE "role"::text = ''COLABORADOR''';
EXCEPTION WHEN others THEN NULL; END $$;

-- Tabelas base (idempotentes)
CREATE TABLE IF NOT EXISTS "Categoria" (
  "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "cor" TEXT NOT NULL DEFAULT '#c8b99a',
  "fotoUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Evento" (
  "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "descricao" TEXT,
  "data" TIMESTAMP(3) NOT NULL, "horario" TEXT NOT NULL,
  "categoriaId" TEXT, "destaque" BOOLEAN NOT NULL DEFAULT false,
  "recorrencia" "Recorrencia" NOT NULL DEFAULT 'NENHUMA',
  "recorrenciaFim" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN ALTER TABLE "Evento" ADD CONSTRAINT "Evento_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Palavra" (
  "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "descricao" TEXT,
  "videoUrl" TEXT, "pregador" TEXT, "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publicado" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Palavra_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GaleriaCategoria" (
  "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "descricao" TEXT,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GaleriaCategoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Foto" (
  "id" TEXT NOT NULL, "url" TEXT NOT NULL, "legenda" TEXT,
  "galeria" TEXT NOT NULL DEFAULT 'geral', "categoriaId" TEXT,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN ALTER TABLE "Foto" ADD CONSTRAINT "Foto_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "GaleriaCategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Playlist" (
  "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "url" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'spotify', "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Config" (
  "id" TEXT NOT NULL, "valor" TEXT NOT NULL,
  CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lider" (
  "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "cargo" TEXT NOT NULL,
  "bio" TEXT, "fotoUrl" TEXT, "ordem" INTEGER NOT NULL DEFAULT 0,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Aviso" (
  "id" TEXT NOT NULL, "texto" TEXT NOT NULL, "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- Perfis
CREATE TABLE IF NOT EXISTS "Perfil" (
  "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "descricao" TEXT,
  "permissoes" TEXT NOT NULL DEFAULT '{}', "sistema" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Perfil_nome_key" ON "Perfil"("nome");

INSERT INTO "Perfil" ("id","nome","descricao","permissoes","sistema","updatedAt") VALUES
  ('perfil_superadmin','Super Admin','Acesso total. Não pode ser excluído.',
   '{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":true,"usuarios":true,"configuracoes":true,"perfis":true,"inscricoes":true,"participantes":true}',true,NOW()),
  ('perfil_admin','Administrador','Acesso total exceto Super Admins e Perfis do sistema.',
   '{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":true,"usuarios":true,"configuracoes":true,"perfis":false,"inscricoes":true,"participantes":true}',true,NOW()),
  ('perfil_editor','Editor','Gerencia conteúdo.',
   '{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":false,"usuarios":false,"configuracoes":false,"perfis":false,"inscricoes":true,"participantes":true}',true,NOW())
ON CONFLICT ("nome") DO NOTHING;

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "perfilId" TEXT;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- Preencher username
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='email') THEN
    UPDATE "User" SET "username" = lower(split_part(email,'@',1)) WHERE "username" IS NULL AND email IS NOT NULL;
  END IF;
  UPDATE "User" SET "username" = 'user_' || lower(substring(id,2,8)) WHERE "username" IS NULL;
END $$;

DO $$ BEGIN ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL; EXCEPTION WHEN others THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

UPDATE "User" SET "perfilId" = 'perfil_superadmin' WHERE "role"::text = 'SUPERADMIN' AND "perfilId" IS NULL;
UPDATE "User" SET "perfilId" = 'perfil_admin'      WHERE "role"::text = 'ADMIN'      AND "perfilId" IS NULL;
UPDATE "User" SET "perfilId" = 'perfil_editor'     WHERE "role"::text = 'EDITOR'     AND "perfilId" IS NULL;

DO $$ BEGIN ALTER TABLE "User" ADD CONSTRAINT "User_perfilId_fkey"
  FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Participante (com endereço)
CREATE TABLE IF NOT EXISTS "Participante" (
  "id"         TEXT NOT NULL, "nome" TEXT NOT NULL, "telefone" TEXT NOT NULL DEFAULT '',
  "sexo"       TEXT, "idade" INTEGER,
  "logradouro" TEXT, "numero" TEXT, "bairro" TEXT, "cidade" TEXT, "estado" TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- Adicionar colunas de endereço se a tabela já existir
ALTER TABLE "Participante" ADD COLUMN IF NOT EXISTS "logradouro" TEXT;
ALTER TABLE "Participante" ADD COLUMN IF NOT EXISTS "numero"     TEXT;
ALTER TABLE "Participante" ADD COLUMN IF NOT EXISTS "bairro"     TEXT;
ALTER TABLE "Participante" ADD COLUMN IF NOT EXISTS "cidade"     TEXT;
ALTER TABLE "Participante" ADD COLUMN IF NOT EXISTS "estado"     TEXT;
-- Tornar telefone obrigatório (preencher vazios antes)
UPDATE "Participante" SET "telefone" = '' WHERE "telefone" IS NULL;
DO $$ BEGIN ALTER TABLE "Participante" ALTER COLUMN "telefone" SET NOT NULL; EXCEPTION WHEN others THEN NULL; END $$;

-- EventoInscricao
CREATE TABLE IF NOT EXISTS "EventoInscricao" (
  "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "descricao" TEXT,
  "fotoUrl" TEXT, "slug" TEXT NOT NULL,
  "telefoneObrig" BOOLEAN NOT NULL DEFAULT false,
  "sexoObrig"     BOOLEAN NOT NULL DEFAULT false,
  "idadeObrig"    BOOLEAN NOT NULL DEFAULT false,
  "enderecoObrig" BOOLEAN NOT NULL DEFAULT false,
  "datas"         TEXT NOT NULL DEFAULT '[]',
  "dataEncerramento" TIMESTAMP(3) NOT NULL,
  "ativo"         BOOLEAN NOT NULL DEFAULT true,
  "vagas"         INTEGER,
  "campoAnexoLabel" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventoInscricao_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventoInscricao_slug_key" ON "EventoInscricao"("slug");
ALTER TABLE "EventoInscricao" ADD COLUMN IF NOT EXISTS "enderecoObrig" BOOLEAN NOT NULL DEFAULT false;

-- Inscricao
CREATE TABLE IF NOT EXISTS "Inscricao" (
  "id"             TEXT NOT NULL, "participanteId" TEXT NOT NULL, "eventoId" TEXT NOT NULL,
  "anexoUrl"       TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Inscricao_participanteId_eventoId_key" ON "Inscricao"("participanteId","eventoId");
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "anexoUrl" TEXT;
DO $$ BEGIN ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_participanteId_fkey"
  FOREIGN KEY ("participanteId") REFERENCES "Participante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_eventoId_fkey"
  FOREIGN KEY ("eventoId") REFERENCES "EventoInscricao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Push Subscriptions para notificações
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id"        TEXT NOT NULL,
  "endpoint"  TEXT NOT NULL,
  "p256dh"    TEXT NOT NULL,
  "auth"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
