# Arquitetura — CCCN Site

## Clean Architecture Aplicada ao Next.js

```
app/                     ← Delivery Layer (HTTP, UI)
  api/                   ← Controllers HTTP
  (public)/              ← Pages públicas (SSR/RSC)
  admin/                 ← Pages admin (CSR)

lib/                     ← Infrastructure + Use Cases
  domain/                ← Entidades e regras de negócio puras
  repositories/          ← Acesso a dados (Prisma)
  use-cases/             ← Casos de uso da aplicação
  apiAuth.ts             ← Auth middleware
  prisma.ts              ← Instância do ORM
  validators.ts          ← Validações de domínio
  rateLimit.ts           ← Proteção de infraestrutura

components/              ← UI Components
  admin/                 ← Componentes do painel
```

## Regras de dependência

- `domain/` não importa nada externo
- `repositories/` importa apenas `domain/` e `prisma`
- `use-cases/` importa `domain/` e `repositories/`
- `api/` importa `use-cases/`, `apiAuth`, `validators`
- `components/` importa apenas tipos de `domain/`
