import { prisma } from '@/lib/prisma'
import { UserEntity } from '@/lib/domain/entities'

export const userRepository = {
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { perfil: { select: { id: true, nome: true, permissoes: true } } },
    })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, username: true, role: true, perfilId: true, perfil: { select: { nome: true } }, createdAt: true },
    })
  },

  async findAll() {
    return prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, perfilId: true, perfil: { select: { nome: true } }, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 500,
    })
  },

  async usernameExists(username: string, excludeId?: string) {
    return prisma.user.findFirst({
      where: { username: username.toLowerCase(), ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  },

  async create(data: { name: string; username: string; passwordHash: string; role: string; perfilId?: string | null }) {
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username.toLowerCase(),
        password: data.passwordHash,
        role: data.role as any,
        perfilId: data.perfilId ?? null,
      },
      select: { id: true, name: true, username: true, role: true, perfilId: true, createdAt: true },
    })
  },

  async update(id: string, data: { name?: string; username?: string; password?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, username: true, role: true },
    })
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  },
}
