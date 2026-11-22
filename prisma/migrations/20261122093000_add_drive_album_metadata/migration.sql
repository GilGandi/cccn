-- Tie each public Drive subfolder to editable website album metadata.
ALTER TABLE "GaleriaCategoria"
  ADD COLUMN IF NOT EXISTS "categoria" TEXT,
  ADD COLUMN IF NOT EXISTS "driveFolderId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "GaleriaCategoria_driveFolderId_key"
  ON "GaleriaCategoria"("driveFolderId");
