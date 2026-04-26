-- Campo configurável de anexo no evento
ALTER TABLE "EventoInscricao" ADD COLUMN IF NOT EXISTS "campoAnexoLabel" TEXT;

-- URL do anexo enviado pelo participante na inscrição
ALTER TABLE "Inscricao" ADD COLUMN IF NOT EXISTS "anexoUrl" TEXT;
