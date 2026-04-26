import { prisma } from '@/lib/prisma'

export const participanteRepository = {
  async search(q: string, take = 50) {
    return prisma.participante.findMany({
      where: { nome: { contains: q, mode: 'insensitive' } },
      orderBy: { nome: 'asc' },
      take,
      include: { _count: { select: { inscricoes: true } } },
    })
  },

  async searchPublic(q: string) {
    // Apenas id e nome — sem dados pessoais
    return prisma.participante.findMany({
      where: { nome: { contains: q, mode: 'insensitive' } },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
      take: 8,
    })
  },

  async findById(id: string) {
    return prisma.participante.findUnique({
      where: { id },
      include: { inscricoes: { include: { evento: { select: { titulo: true, slug: true, dataEncerramento: true } } } } },
    })
  },

  async create(data: { nome: string; telefone?: string | null; sexo?: string | null; idade?: number | null }) {
    return prisma.participante.create({ data })
  },

  async update(id: string, data: { nome?: string; telefone?: string | null; sexo?: string | null; idade?: number | null }) {
    return prisma.participante.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.participante.delete({ where: { id } })
  },
}
