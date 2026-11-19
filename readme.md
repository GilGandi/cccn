# Comunidade Cristã de Campos Novos — Site Oficial

Site oficial da C.C.C.N Ministério Apostólico do Coração de Deus.

## Tecnologias e mídia

- **Next.js** (App Router), TypeScript e Tailwind CSS
- **Prisma + PostgreSQL**
- **Google Drive API** (leitura da galeria pública)
- **NextAuth** (autenticação)
- **Railway** (deploy)

A galeria é somente leitura: imagens em subpastas imediatas da pasta configurada aparecem como álbuns; imagens soltas aparecem em “Geral”. Para atualizar o conteúdo, organize os arquivos diretamente no Google Drive.

## Deploy no Railway

1. Crie o projeto a partir do repositório e adicione PostgreSQL; o Railway injeta `DATABASE_URL`.
2. Configure as variáveis de ambiente abaixo.
3. Defina a pasta do Google Drive como **qualquer pessoa com o link pode visualizar** e habilite a Google Drive API no projeto associado à chave.
4. Faça o deploy.

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL |
| `NEXTAUTH_URL` | URL pública do site |
| `NEXTAUTH_SECRET` | Segredo de autenticação (`openssl rand -base64 32`) |
| `GOOGLE_DRIVE_GALLERY_FOLDER_URL` | URL ou ID da pasta pública da galeria |
| `GOOGLE_DRIVE_API_KEY` | Chave de servidor da Google Drive API |
| `NODE_ENV` | `production` no deploy |

A variável da pasta pode ser adicionada/alterada sem mudanças no código. A chave da API deve permanecer apenas no ambiente do servidor, nunca com prefixo `NEXT_PUBLIC_`.

## Rodar localmente

```bash
npm install
# configure .env.local com as variáveis acima
npx prisma migrate dev
npm run dev
```

Para criar uma conta administrativa, siga o procedimento de seed configurado no ambiente da aplicação e troque a senha inicial após o primeiro acesso.

## Imagens fora da galeria

Os campos administrativos de imagem aceitam uma URL HTTPS pública. O envio de imagens e anexos para serviços externos foi removido; anexo de arquivo em inscrições não está disponível nesta versão. URLs antigas já salvas no banco e arquivos existentes nos serviços externos não são apagados por esta alteração.

## Dados da Igreja

- **CNPJ:** 18.702.714/0001-07
- **Endereço:** Rua João Gonçalves de Araújo, 829 — Bairro Aparecida, Campos Novos – SC
- **Telefone:** (49) 9152-9414
- **Instagram:** @cccnchurch
