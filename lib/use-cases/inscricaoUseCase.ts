import { prisma } from '@/lib/prisma'
import { participanteRepository } from '@/lib/repositories/participanteRepository'
import { inscricaoRepository } from '@/lib/repositories/inscricaoRepository'
import {
  isEventoEncerrado,
  isEventoEsgotado,
  validateParticipanteNome,
  validateSexo,
  validateIdade,
} from '@/lib/domain/rules'

interface InscricaoInput {
  participanteId?: string
  nome?: string
  telefone?: string
  sexo?: string
  idade?: number | null
}

export async function executarInscricao(eventoId: string, input: InscricaoInput) {
  // 1. Buscar evento
  const evento = await prisma.eventoInscricao.findUnique({ where: { id: eventoId } })
  if (!evento) return { ok: false, error: 'Evento não encontrado.', status: 404 }
  if (!evento.ativo) return { ok: false, error: 'Evento encerrado.', status: 400 }

  // 2. Regras de domínio
  if (isEventoEncerrado(evento.dataEncerramento))
    return { ok: false, error: 'Período de inscrição encerrado.', status: 400 }

  const count = await inscricaoRepository.countByEvento(eventoId)
  if (isEventoEsgotado(count, evento.vagas))
    return { ok: false, error: 'Vagas esgotadas.', status: 400 }

  // 3. Resolver participante
  let participanteId: string

  if (input.participanteId) {
    const p = await participanteRepository.findById(input.participanteId)
    if (!p) return { ok: false, error: 'Participante não encontrado.', status: 404 }
    participanteId = p.id

    // Atualizar dados se fornecidos
    const update: any = {}
    if (input.telefone?.trim()) update.telefone = input.telefone.trim().replace(/\D/g, '').slice(0, 15)
    if (input.sexo && ['M','F'].includes(input.sexo)) update.sexo = input.sexo
    if (input.idade !== undefined && input.idade !== null) update.idade = Math.max(0, Math.min(150, Number(input.idade)))
    if (Object.keys(update).length > 0) await participanteRepository.update(participanteId, update)
  } else {
    // Validar campos obrigatórios
    const nomeError = validateParticipanteNome(input.nome ?? '')
    if (nomeError) return { ok: false, error: nomeError, status: 400 }

    if (evento.telefoneObrig && !input.telefone?.trim())
      return { ok: false, error: 'Telefone é obrigatório para este evento.', status: 400 }
    if (evento.sexoObrig && !input.sexo)
      return { ok: false, error: 'Sexo é obrigatório para este evento.', status: 400 }
    if (evento.idadeObrig && (input.idade === undefined || input.idade === null))
      return { ok: false, error: 'Idade é obrigatória para este evento.', status: 400 }
    if (input.sexo) {
      const sexoError = validateSexo(input.sexo)
      if (sexoError) return { ok: false, error: sexoError, status: 400 }
    }
    if (input.idade !== undefined && input.idade !== null) {
      const idadeError = validateIdade(input.idade)
      if (idadeError) return { ok: false, error: idadeError, status: 400 }
    }

    const novo = await participanteRepository.create({
      nome: input.nome!.trim().slice(0, 200),
      telefone: input.telefone?.trim().replace(/\D/g, '').slice(0, 15) || null,
      sexo: input.sexo || null,
      idade: input.idade !== undefined && input.idade !== null ? Number(input.idade) : null,
    })
    participanteId = novo.id
  }

  // 4. Verificar duplicidade
  const dup = await inscricaoRepository.findDuplicate(participanteId, eventoId)
  if (dup) return { ok: false, error: 'Já inscrito neste evento.', inscricaoId: dup.id, status: 400 }

  // 5. Criar inscrição
  const inscricao = await inscricaoRepository.create(participanteId, eventoId)
  return { ok: true, inscricao }
}
