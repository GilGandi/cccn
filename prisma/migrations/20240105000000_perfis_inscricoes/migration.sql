-- ============================================================
-- Migration consolidada e idempotente
-- Inclui tudo que a 20240104 deveria ter feito
-- ============================================================

-- 1. Adicionar valores ao enum Role (idempotente via DO block)
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';
EXCEPTION WHEN others THEN null; END $$;

-- COMMIT implícito necessário antes de usar os novos valores
-- PostgreSQL não permite usar valores de enum adicionados na mesma transação
-- Solução: usar ::text para comparação e cast explícito

-- 2. Migrar roles existentes (antes de adicionar novas colunas)
DO $$ BEGIN
  EXECUTE 'UPDATE "User" SET "role" = ''SUPERADMIN''::text::"Role" WHERE "role"::text = ''ADMIN''';
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  EXECUTE 'UPDATE "User" SET "role" = ''EDITOR''::text::"Role" WHERE "role"::text = ''COLABORADOR''';
EXCEPTION WHEN others THEN null; END $$;

-- 3. Colunas novas no User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "perfilId" TEXT;

-- 4. Preencher username
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'email') THEN
    UPDATE "User" SET "username" = lower(split_part(email, '@', 1))
    WHERE "username" IS NULL AND email IS NOT NULL;
  END IF;
  UPDATE "User" SET "username" = 'user_' || lower(substring(id, 2, 8))
  WHERE "username" IS NULL;
END $$;

-- 5. Resolver duplicatas de username
DO $$ DECLARE r RECORD; counter INT;
BEGIN
  FOR r IN SELECT username, array_agg(id ORDER BY "createdAt") AS ids
    FROM "User" GROUP BY username HAVING count(*) > 1
  LOOP
    counter := 1;
    FOR i IN 2..array_length(r.ids, 1) LOOP
      UPDATE "User" SET username = r.username || '_' || counter WHERE id = r.ids[i];
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- 6. Tabela Perfil
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

INSERT INTO "Perfil" ("id","nome","descricao","permissoes","sistema","updatedAt") VALUES
  ('perfil_superadmin','Super Admin','Acesso total. Não pode ser excluído.','{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":true,"usuarios":true,"configuracoes":true,"perfis":true,"inscricoes":true,"participantes":true}',true,NOW()),
  ('perfil_admin','Administrador','Acesso total exceto Super Admins e Perfis do sistema.','{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":true,"usuarios":true,"configuracoes":true,"perfis":false,"inscricoes":true,"participantes":true}',true,NOW()),
  ('perfil_editor','Editor','Gerencia conteúdo. Não acessa Usuários nem Configurações.','{"agenda":true,"avisos":true,"galeria":true,"palavras":true,"louvor":true,"lideres":false,"usuarios":false,"configuracoes":false,"perfis":false,"inscricoes":true,"participantes":true}',true,NOW())
ON CONFLICT ("nome") DO NOTHING;

-- 7. Vincular usuários a perfis (usando ::text para evitar erro de enum)
UPDATE "User" SET "perfilId" = 'perfil_superadmin' WHERE "role"::text = 'SUPERADMIN' AND "perfilId" IS NULL;
UPDATE "User" SET "perfilId" = 'perfil_admin'      WHERE "role"::text = 'ADMIN'      AND "perfilId" IS NULL;
UPDATE "User" SET "perfilId" = 'perfil_editor'     WHERE "role"::text = 'EDITOR'     AND "perfilId" IS NULL;

-- 8. FK perfilId
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_perfilId_fkey"
    FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. Participante
CREATE TABLE IF NOT EXISTS "Participante" (
  "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "telefone" TEXT,
  "sexo" TEXT, "idade" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- 10. EventoInscricao
CREATE TABLE IF NOT EXISTS "EventoInscricao" (
  "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "descricao" TEXT,
  "fotoUrl" TEXT, "slug" TEXT NOT NULL,
  "telefoneObrig" BOOLEAN NOT NULL DEFAULT false,
  "sexoObrig" BOOLEAN NOT NULL DEFAULT false,
  "idadeObrig" BOOLEAN NOT NULL DEFAULT false,
  "datas" TEXT NOT NULL DEFAULT '[]',
  "dataEncerramento" TIMESTAMP(3) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true, "vagas" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventoInscricao_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventoInscricao_slug_key" ON "EventoInscricao"("slug");

-- 11. Inscricao
CREATE TABLE IF NOT EXISTS "Inscricao" (
  "id" TEXT NOT NULL, "participanteId" TEXT NOT NULL,
  "eventoId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Inscricao_part_evento_key"
  ON "Inscricao"("participanteId","eventoId");

DO $$ BEGIN
  ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_participanteId_fkey"
    FOREIGN KEY ("participanteId") REFERENCES "Participante"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_eventoId_fkey"
    FOREIGN KEY ("eventoId") REFERENCES "EventoInscricao"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 12. Outras tabelas
CREATE TABLE IF NOT EXISTS "Playlist" (
  "id" TEXT NOT NULL, "titulo" TEXT NOT NULL, "url" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'spotify', "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lider" (
  "id" TEXT NOT NULL, "nome" TEXT NOT NULL, "cargo" TEXT NOT NULL,
  "bio" TEXT, "fotoUrl" TEXT, "ordem" INTEGER NOT NULL DEFAULT 0,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Config" (
  "id" TEXT NOT NULL, "valor" TEXT NOT NULL,
  CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE TYPE "Recorrencia" AS ENUM ('NENHUMA','SEMANAL','QUINZENAL','MENSAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Evento" ADD COLUMN IF NOT EXISTS "recorrencia" "Recorrencia" NOT NULL DEFAULT 'NENHUMA';
ALTER TABLE "Evento" ADD COLUMN IF NOT EXISTS "recorrenciaFim" TIMESTAMP(3);
