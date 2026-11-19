# Comunidade Cristã de Campos Novos — Site Oficial

Site oficial da C.C.C.N Ministério Apostólico do Coração de Deus.

## Tecnologias

- **Next.js 15** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Prisma + PostgreSQL**
- **Cloudinary** (upload de imagens)
- **NextAuth** (autenticação)
- **Railway** (deploy)

---

## Deploy no Railway

### 1. Criar o projeto
Acesse https://railway.app → **New Project → Deploy from GitHub repo**

### 2. Adicionar banco de dados
No painel: **New → Database → Add PostgreSQL**  
O Railway injeta `DATABASE_URL` automaticamente.

### 3. Variáveis de ambiente
No serviço: **Variables → New Variable**

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Gerado automaticamente |
| `NEXTAUTH_URL` | `https://SEU-DOMINIO.up.railway.app` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | Seu cloud name |
| `CLOUDINARY_API_KEY` | Sua API key |
| `CLOUDINARY_API_SECRET` | Seu API secret |
| `NODE_ENV` | `production` |

### 4. Deploy
O Railway faz automaticamente após configurar as variáveis.

### 5. Criar admin
```bash
curl -X POST https://SEU-DOMINIO.up.railway.app/api/seed
```
- Email: `admin@cccn.com.br` / Senha: `cccn@2024`
- **Mude a senha após o primeiro login!**

---

## Rodar localmente

```bash
npm install
# configure .env.local com as variáveis acima
npx prisma migrate dev
npm run dev
```

---

## Dados da Igreja

- **CNPJ:** 18.702.714/0001-07
- **Endereço:** Rua João Gonçalves de Araújo, 829 — Bairro Aparecida, Campos Novos – SC
- **Telefone:** (49) 9152-9414
- **Instagram:** @cccnchurch
