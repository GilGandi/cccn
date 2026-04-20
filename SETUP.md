# Variáveis de Ambiente — Configurar no Netlify

Acesse: Netlify → Site → Site configuration → Environment variables

Adicione as seguintes variáveis:

| Variável | Valor |
|---|---|
| DATABASE_URL | (use a string de conexão do Neon — não compartilhe publicamente) |
| NEXTAUTH_URL | https://SEU-SITE.netlify.app (substitua pela URL real) |
| NEXTAUTH_SECRET | cccn-super-secret-key-2024-mude-em-producao |

## Após o deploy, criar o primeiro usuário admin:

Acesse no navegador:
POST https://SEU-SITE.netlify.app/api/seed

Pode usar o curl ou o Postman:
```
curl -X POST https://SEU-SITE.netlify.app/api/seed
```

Credenciais criadas:
- Email: admin@cccn.com.br
- Senha: cccn@2024

**MUDE A SENHA após o primeiro login!**

## Rodar o banco localmente (primeira vez):

```bash
npm install
npx prisma db push
npm run dev
```
