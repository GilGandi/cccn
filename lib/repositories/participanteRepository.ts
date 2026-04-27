import { prisma } from '@/lib/prisma'
import { normalizarNome } from '@/lib/domain/rules'

interface CreateData {
  nome: string
  telefone: string  // obrigatório
  sexo?: string | null
  idade?: number | null
  logradouro?: string | null
  numero?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
}

interface UpdateData {
  nome?: string
  telefone?: string
  sexo?: string | null
  idade?: number | null
  logradouro?: string | null
  numero?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
}

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
    if (!telefoneNorm) return null
    const candidatos = await prisma.participante.findMany({
      where: { telefone: telefoneNorm },
      take: 10,
    })
    return candidatos.find(p => normalizarNome(p.nome) === nomeNorm) ?? null
  },

  async findByNomeApenas(nomeNorm: string) {
    const todos = await prisma.participante.findMany({ take: 500 })
    return todos.find(p => normalizarNome(p.nome) === nomeNorm) ?? null
  },

  async create(data: CreateData) {
    return prisma.participante.create({
      data: {
        ...data,
        telefone: data.telefone.replace(/\D/g, ''),
      },
    })
  },

  async update(id: string, data: UpdateData) {
    const update: any = { ...data }
    if (typeof update.telefone === 'string') {
      update.telefone = update.telefone.replace(/\D/g, '')
    }
    return prisma.participante.update({ where: { id }, data: update })
  },

  async delete(id: string) {
    return prisma.participante.delete({ where: { id } })
  },
}
