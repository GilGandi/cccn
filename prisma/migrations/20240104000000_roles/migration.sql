-- Adicionar novos valores ao enum Role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';

-- Migrar dados: ADMIN vira SUPERADMIN, COLABORADOR vira EDITOR
UPDATE "User" SET "role" = 'SUPERADMIN' WHERE "role" = 'ADMIN';
UPDATE "User" SET "role" = 'EDITOR' WHERE "role" = 'COLABORADOR';
