import { prisma } from '@/lib/prisma'

export const inscricaoRepository = {
  async findByEvento(eventoId: string) {
    return prisma.inscricao.findMany({
      where: { eventoId },
      include: { participante: true },
      orderBy: { createdAt: 'asc' },
      take: 1000,
    })
  },

  async findDuplicate(participanteId: string, eventoId: string) {
    return prisma.inscricao.findUnique({
      where: { participanteId_eventoId: { participanteId, eventoId } },
    })
  },

  async countByEvento(eventoId: string) {
    return prisma.inscricao.count({ where: { eventoId } })
  },

  async create(participanteId: string, eventoId: string, anexoUrl?: string | null) {
    return prisma.inscricao.create({
      data: { participanteId, eventoId, ...(anexoUrl ? { anexoUrl } : {}) },
      include: { participante: true },
    })
  },

  async delete(id: string) {
    return prisma.inscricao.delete({ where: { id } })
  },
}
