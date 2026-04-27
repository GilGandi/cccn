-- Garantir que SUPERADMIN existe no enum
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';
EXCEPTION WHEN others THEN null; END $$;

-- Converter qualquer usuário ainda com role ADMIN para SUPERADMIN
-- usando EXECUTE para contornar a limitação de transação do PostgreSQL
DO $$ BEGIN
  EXECUTE 'UPDATE "User" SET "role" = ''SUPERADMIN''::text::"Role" WHERE "role"::text = ''ADMIN''';
EXCEPTION WHEN others THEN null; END $$;

-- Atualizar perfilId para quem mudou para SUPERADMIN
UPDATE "User" SET "perfilId" = 'perfil_superadmin'
WHERE "role"::text = 'SUPERADMIN' AND ("perfilId" IS NULL OR "perfilId" = 'perfil_admin');

-- Converter COLABORADOR para EDITOR se ainda existir
DO $$ BEGIN
  EXECUTE 'UPDATE "User" SET "role" = ''EDITOR''::text::"Role" WHERE "role"::text = ''COLABORADOR''';
EXCEPTION WHEN others THEN null; END $$;
