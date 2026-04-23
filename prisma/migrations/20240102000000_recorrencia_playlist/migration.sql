-- CreateEnum
CREATE TYPE "Recorrencia" AS ENUM ('NENHUMA', 'SEMANAL', 'QUINZENAL', 'MENSAL');

-- AlterTable Evento
ALTER TABLE "Evento" ADD COLUMN "recorrencia" "Recorrencia" NOT NULL DEFAULT 'NENHUMA';
ALTER TABLE "Evento" ADD COLUMN "recorrenciaFim" TIMESTAMP(3);

-- CreateTable Playlist
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'spotify',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);
