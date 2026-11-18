-- Add an optional cover image URL for each gallery album.
ALTER TABLE "GaleriaCategoria" ADD COLUMN IF NOT EXISTS "capaUrl" TEXT;
