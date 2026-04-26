// Entidades do domínio — puras, sem dependências externas

export type Role = 'SUPERADMIN' | 'ADMIN' | 'EDITOR'

export interface UserEntity {
  id: string
  name: string
  username: string
  role: Role
  perfilId: string | null
  createdAt: Date
}

export interface PerfilEntity {
  id: string
  nome: string
  descricao: string | null
  permissoes: PermissoesMap
  sistema: boolean
}

export interface PermissoesMap {
  agenda?: boolean
  avisos?: boolean
  galeria?: boolean
  palavras?: boolean
  louvor?: boolean
  lideres?: boolean
  inscricoes?: boolean
  participantes?: boolean
  usuarios?: boolean
  configuracoes?: boolean
  perfis?: boolean
}

export interface EventoEntity {
  id: string
  titulo: string
  descricao: string | null
  data: Date
  horario: string
  categoriaId: string | null
  recorrencia: RecorrenciaType
  recorrenciaFim: Date | null
}

export type RecorrenciaType = 'NENHUMA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL'

export interface ParticipanteEntity {
  id: string
  nome: string
  telefone: string | null
  sexo: SexoType | null
  idade: number | null
}

export type SexoType = 'M' | 'F'

export interface EventoInscricaoEntity {
  id: string
  titulo: string
  slug: string
  fotoUrl: string | null
  datas: string[]
  dataEncerramento: Date
  telefoneObrig: boolean
  sexoObrig: boolean
  idadeObrig: boolean
  vagas: number | null
  ativo: boolean
}

export interface InscricaoEntity {
  id: string
  participanteId: string
  eventoId: string
  createdAt: Date
}
