-- Remove permanentemente os dados de telefone de contatos e inscrições.
DELETE FROM "Config" WHERE "id" IN ('telefone', 'telefone_link', 'whatsapp');
UPDATE "Config" AS chave
SET "valor" = ''
WHERE chave."id" = 'pix_chave'
  AND EXISTS (
    SELECT 1 FROM "Config" AS tipo
    WHERE tipo."id" = 'pix_tipo'
      AND LOWER(tipo."valor") IN ('telefone', 'celular', 'phone')
  );
ALTER TABLE "Participante" DROP COLUMN IF EXISTS "telefone";
ALTER TABLE "EventoInscricao" DROP COLUMN IF EXISTS "telefoneObrig";

-- Preserva o texto que antes era completado automaticamente pelo título da home.
UPDATE "Config"
SET "valor" = 'Bem-vindo à sua família em Cristo'
WHERE "id" = 'hero_subtitulo' AND TRIM("valor") = 'Bem-vindo à';
