import bcrypt from 'bcryptjs'
import { userRepository } from '@/lib/repositories/userRepository'
import { canDeleteUser, validateUsername } from '@/lib/domain/rules'

export async function criarUsuario(data: {
  name: string
  username: string
  password: string
  role: string
  perfilId?: string | null
  actorRole: string
}) {
  const usernameError = validateUsername(data.username)
  if (usernameError) return { ok: false, error: usernameError, status: 400 }

  if (!data.name?.trim()) return { ok: false, error: 'Nome é obrigatório.', status: 400 }
  if (!data.password || data.password.length < 8)
    return { ok: false, error: 'Senha deve ter mínimo 8 caracteres.', status: 400 }

  const allowedRoles = ['EDITOR', ...(data.actorRole === 'SUPERADMIN' ? ['ADMIN'] : [])]
  const role = allowedRoles.includes(data.role) ? data.role : 'EDITOR'

  if (data.actorRole === 'ADMIN' && role === 'ADMIN')
    return { ok: false, error: 'Somente o Super Admin pode criar administradores.', status: 403 }

  const exists = await userRepository.usernameExists(data.username)
  if (exists) return { ok: false, error: 'Username já está em uso.', status: 400 }

  const passwordHash = await bcrypt.hash(data.password, 12)
  const user = await userRepository.create({ name: data.name.trim().slice(0, 100), username: data.username.toLowerCase(), passwordHash, role, perfilId: data.perfilId ?? null })
  return { ok: true, user }
}

export async function deletarUsuario(data: { actorId: string; actorRole: string; targetId: string }) {
  const target = await userRepository.findById(data.targetId)
  if (!target) return { ok: false, error: 'Usuário não encontrado.', status: 404 }

  const check = canDeleteUser(data.actorId, data.actorRole, data.targetId, target.role)
  if (!check.allowed) return { ok: false, error: check.reason!, status: 403 }

  await userRepository.delete(data.targetId)
  return { ok: true }
}
