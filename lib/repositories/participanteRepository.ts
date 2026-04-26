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

  async findByNomeETelefone(nomeNorm: string, telefoneNorm: string) {
    // Busca participante existente por telefone (normalizado) + nome normalizado
    // Telefone é o identificador mais forte; nome confirma a identidade
    if (!telefoneNorm) return null
    const candidatos = await prisma.participante.findMany({
      where: { telefone: telefoneNorm },
      take: 10,
    })
    // Comparar nome normalizado
    const { normalizarNome } = await import('@/lib/domain/rules')
    return candidatos.find(p => normalizarNome(p.nome) === nomeNorm) ?? null
  },

  async findByNomeApenas(nomeNorm: string) {
    // Sem telefone: busca só por nome normalizado (menos confiável)
    const todos = await prisma.participante.findMany({ take: 500 })
    const { normalizarNome } = await import('@/lib/domain/rules')
    return todos.find(p => normalizarNome(p.nome) === nomeNorm) ?? null
  },

  async create(data: { nome: string; telefone?: string | null; sexo?: string | null; idade?: number | null }) {
    // Normalizar telefone antes de salvar
    const normalized = {
      ...data,
      telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
    }
    return prisma.participante.create({ data: normalized })
  },

  async update(id: string, data: { nome?: string; telefone?: string | null; sexo?: string | null; idade?: number | null }) {
    return prisma.participante.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.participante.delete({ where: { id } })
  },
}
