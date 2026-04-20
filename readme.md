# Comunidade Cristã de Campos Novos — Site Oficial

Site oficial da C.C.C.N Ministério Apostólico do Coração de Deus.

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Vercel** (deploy)

---

## Como rodar localmente

### 1. Pré-requisito: instalar Node.js
Baixe em: https://nodejs.org (versão LTS)

### 2. Instalar dependências
```bash
npm install
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Como publicar na internet (Vercel) — passo a passo

### Opção A — Pelo GitHub (recomendado)

1. Crie uma conta gratuita em https://github.com
2. Crie um repositório novo (ex: `cccn-site`)
3. Faça upload dos arquivos deste projeto para o repositório
4. Acesse https://vercel.com e entre com sua conta GitHub
5. Clique em **"Add New Project"**
6. Selecione o repositório `cccn-site`
7. Clique em **"Deploy"**
8. Em menos de 2 minutos o site estará no ar com uma URL pública!

### Opção B — Vercel CLI

```bash
npm install -g vercel
vercel
```

Siga as instruções no terminal. O site sobe automaticamente.

---

## Estrutura do projeto

```
cccn-site/
├── app/
│   ├── layout.tsx          # Layout raiz (fontes, metadata)
│   ├── globals.css         # Estilos globais
│   ├── page.tsx            # Home
│   ├── historia/page.tsx   # Nossa História
│   ├── agenda/page.tsx     # Agenda
│   ├── palavras/page.tsx   # Palavras
│   ├── doacoes/page.tsx    # Doações
│   └── contato/page.tsx    # Contato
├── components/
│   ├── Navbar.tsx          # Navegação (responsiva)
│   ├── Footer.tsx          # Rodapé com dados oficiais
│   ├── WoodCross.tsx       # Cruz de madeira SVG (fundo)
│   ├── ChurchLogo.tsx      # Logo da igreja SVG
│   ├── ScrollReveal.tsx    # Animação de entrada por scroll
│   └── CopyPix.tsx         # Botão copiar chave Pix
└── public/                 # Imagens e assets estáticos
```

---

## Dados da Igreja

- **Razão Social:** Comunidade Cristã de Campos Novos — C.C.C.N Ministério Apostólico do Coração de Deus
- **CNPJ:** 18.702.714/0001-07
- **Endereço:** Rua João Gonçalves de Araújo, 829 — Bairro Aparecida, Campos Novos – SC, CEP 89620-000
- **Telefone:** (49) 9152-9414
- **Instagram:** @cccnchurch
- **Cultos:** Domingos das 19h às 21h
