import { prisma } from '@/lib/prisma'
import { participanteRepository } from '@/lib/repositories/participanteRepository'
import { inscricaoRepository } from '@/lib/repositories/inscricaoRepository'
import {
  isEventoEncerrado,
  isEventoEsgotado,
  validateParticipanteNome,
  validateSexo,
  validateIdade,
  normalizarNome,
  normalizarTelefone,
  formatarTelefone,
} from '@/lib/domain/rules'

interface InscricaoInput {
  participanteId?: string
  nome?: string
  telefone?: string
  sexo?: string
  idade?: number | null
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  anexoUrl?: string | null
}

export async function executarInscricao(eventoId: string, input: InscricaoInput) {
  // 1. Buscar e validar evento
  const evento = await prisma.eventoInscricao.findUnique({ where: { id: eventoId } })
  if (!evento) return { ok: false, error: 'Evento não encontrado.', status: 404 }
  if (!evento.ativo) return { ok: false, error: 'Evento encerrado.', status: 400 }
  if (isEventoEncerrado(evento.dataEncerramento))
    return { ok: false, error: 'Período de inscrição encerrado.', status: 400 }

  const count = await inscricaoRepository.countByEvento(eventoId)
  if (isEventoEsgotado(count, evento.vagas))
    return { ok: false, error: 'Vagas esgotadas.', status: 400 }

  // 2. Resolver participante
  let participanteId: string

  if (input.participanteId) {
    // Caminho admin: participanteId explícito
    const p = await participanteRepository.findById(input.participanteId)
    if (!p) return { ok: false, error: 'Participante não encontrado.', status: 404 }
    participanteId = p.id

    // Atualizar dados se fornecidos
    const update: any = {}
    if (input.telefone?.trim()) update.telefone = normalizarTelefone(input.telefone)
    if (input.sexo && ['M','F'].includes(input.sexo)) update.sexo = input.sexo
    if (input.idade !== undefined && input.idade !== null) {
      update.idade = Math.max(0, Math.min(150, Number(input.idade)))
    }
    if (Object.keys(update).length > 0) {
      await participanteRepository.update(participanteId, update)
    }
  } else {
    // Caminho público: validar campos
    const nomeError = validateParticipanteNome(input.nome ?? '')
    if (nomeError) return { ok: false, error: nomeError, status: 400 }

    // Telefone sempre obrigatório
    if (!input.telefone?.trim())
      return { ok: false, error: 'Telefone é obrigatório.', status: 400 }
    if (evento.sexoObrig && !input.sexo)
      return { ok: false, error: 'Sexo é obrigatório para este evento.', status: 400 }
    if (evento.idadeObrig && (input.idade === undefined || input.idade === null))
      return { ok: false, error: 'Idade é obrigatória para este evento.', status: 400 }
    if (evento.enderecoObrig && (!input.logradouro?.trim() || !input.bairro?.trim() || !input.cidade?.trim()))
      return { ok: false, error: 'Endereço é obrigatório para este evento.', status: 400 }
    if (input.sexo) {
      const sexoError = validateSexo(input.sexo)
      if (sexoError) return { ok: false, error: sexoError, status: 400 }
    }
    if (input.idade !== undefined && input.idade !== null) {
      const idadeError = validateIdade(input.idade)
      if (idadeError) return { ok: false, error: idadeError, status: 400 }
    }

    // Normalizar nome e telefone para deduplicação
    const nomeNorm = normalizarNome(input.nome!)
    const telNorm  = input.telefone ? normalizarTelefone(input.telefone) : ''

    // Tentar encontrar participante existente (deduplicação)
    let existente = telNorm
      ? await participanteRepository.findByNomeETelefone(nomeNorm, telNorm)
      : await participanteRepository.findByNomeApenas(nomeNorm)

    if (existente) {
      // Reutilizar e atualizar dados
      participanteId = existente.id
      const update: any = {}
      // Atualiza telefone formatado se fornecido
      if (telNorm && existente.telefone !== telNorm) update.telefone = telNorm
      if (input.sexo && existente.sexo !== input.sexo) update.sexo = input.sexo
      if (input.idade !== undefined && input.idade !== null && existente.idade !== Number(input.idade)) {
        update.idade = Math.max(0, Math.min(150, Number(input.idade)))
      }
      if (Object.keys(update).length > 0) {
        await participanteRepository.update(participanteId, update)
      }
    } else {
      // Criar novo participante
      const novo = await participanteRepository.create({
        nome: input.nome!.trim().slice(0, 200),
        telefone: telNorm || null,
        sexo: input.sexo || null,
        idade: input.idade !== undefined && input.idade !== null ? Number(input.idade) : null,
      })
      participanteId = novo.id
    }
  }

  // 3. Verificar duplicidade de inscrição
  const dup = await inscricaoRepository.findDuplicate(participanteId, eventoId)
  if (dup) return { ok: false, error: 'Já inscrito neste evento.', inscricaoId: dup.id, status: 400 }

  // 4. Validar anexo se o evento exige/aceita
  const anexo = input.anexoUrl?.trim() || null
  if (anexo && !anexo.startsWith('https://res.cloudinary.com/')) {
    return { ok: false, error: 'URL de anexo inválida.', status: 400 }
  }

  // 5. Criar inscrição
  const inscricao = await inscricaoRepository.create(participanteId, eventoId, anexo)
  return { ok: true, inscricao }
}
