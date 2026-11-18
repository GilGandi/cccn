-- Adds a selectable public cover image to each gallery album.
ALTER TABLE "GaleriaCategoria" ADD COLUMN IF NOT EXISTS "capaUrl" TEXT;
