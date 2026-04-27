CREATE TABLE IF NOT EXISTS "GaleriaCategoria" (
  "id"        TEXT NOT NULL,
  "nome"      TEXT NOT NULL,
  "descricao" TEXT,
  "ordem"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GaleriaCategoria_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Foto" ADD COLUMN IF NOT EXISTS "categoriaId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Foto" ADD CONSTRAINT "Foto_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "GaleriaCategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
