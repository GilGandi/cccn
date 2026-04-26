// Regras de negócio puras — sem efeitos colaterais, 100% testáveis

import { Role, PermissoesMap } from './entities'

const ROLE_LEVEL: Record<Role, number> = {
  SUPERADMIN: 3,
  ADMIN: 2,
  EDITOR: 1,
}

export function getRoleLevel(role: string): number {
  return ROLE_LEVEL[role as Role] ?? 0
}

export function canManageUser(managerRole: string, targetRole: string): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole)
}

export function canDeleteUser(
  actorId: string,
  actorRole: string,
  targetId: string,
  targetRole: string
): { allowed: boolean; reason?: string } {
  if (actorId === targetId)
    return { allowed: false, reason: 'Você não pode excluir sua própria conta.' }
  if (targetRole === 'SUPERADMIN')
    return { allowed: false, reason: 'O Super Admin não pode ser excluído.' }
  if (actorRole === 'ADMIN' && targetRole === 'ADMIN')
    return { allowed: false, reason: 'Somente o Super Admin pode excluir administradores.' }
  if (!canManageUser(actorRole, targetRole))
    return { allowed: false, reason: 'Sem permissão para excluir este usuário.' }
  return { allowed: true }
}

export function hasPermissao(
  role: string,
  permissoes: PermissoesMap,
  permissao: keyof PermissoesMap
): boolean {
  if (role === 'SUPERADMIN') return true
  return Boolean(permissoes[permissao])
}

export function isEventoEncerrado(dataEncerramento: Date): boolean {
  return new Date() > dataEncerramento
}

export function isEventoEsgotado(inscricoes: number, vagas: number | null): boolean {
  if (vagas === null) return false
  return inscricoes >= vagas
}

export function validateParticipanteNome(nome: string): string | null {
  if (!nome?.trim()) return 'Nome é obrigatório.'
  if (nome.trim().split(/\s+/).length < 2) return 'Informe nome e sobrenome.'
  if (nome.length > 200) return 'Nome muito longo.'
  return null
}

export function validateUsername(username: string): string | null {
  if (!username?.trim()) return 'Username é obrigatório.'
  if (!/^[a-z0-9._-]{3,50}$/i.test(username))
    return 'Username inválido. Use apenas letras, números, ponto, hífen ou underscore (3-50 chars).'
  return null
}

export function validateSexo(sexo: string): string | null {
  if (!['M', 'F'].includes(sexo)) return 'Sexo deve ser M ou F.'
  return null
}

export function validateIdade(idade: unknown): string | null {
  const n = Number(idade)
  if (!Number.isInteger(n) || n < 0 || n > 150) return 'Idade inválida.'
  return null
}

export function generateEventoSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function gerarOcorrencias(
  dataInicio: Date,
  recorrencia: string,
  dataFim: Date | null
): Date[] {
  if (recorrencia === 'NENHUMA') return [dataInicio]

  const fim = dataFim ?? (() => {
    const d = new Date(dataInicio)
    d.setMonth(d.getMonth() + 3)
    return d
  })()

  const datas: Date[] = []
  const atual = new Date(dataInicio)

  while (atual <= fim && datas.length < 52) {
    datas.push(new Date(atual))
    if (recorrencia === 'SEMANAL')   atual.setDate(atual.getDate() + 7)
    if (recorrencia === 'QUINZENAL') atual.setDate(atual.getDate() + 14)
    if (recorrencia === 'MENSAL')    atual.setMonth(atual.getMonth() + 1)
  }

  return datas
}
