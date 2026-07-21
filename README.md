<p align="center">
  <img src="https://img.shields.io/badge/VESTÍGIOS_SYSTEM-7C3AED?style=for-the-badge&logo=&logoColor=white&labelColor=000000" alt="Vestígios System" />
</p>

<h1 align="center">
  <code>VESTÍGIOS SYSTEM</code>
</h1>

<p align="center">
  <em>Sistema de fichas digitais para o universo Vestígios RPG.</em><br>
  Crie, gerencie e jogue com seus personagens.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=000000" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Zustand-2D2D2D?style=flat-square&logo=redux&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## Sobre

**Vestígios System** é o sistema completo de gerenciamento de fichas digitais para o RPG Vestígios. Com ele, jogadores podem criar personagens, gerenciar campanhas, rolar dados e acessar o escudo do mestre — tudo em uma interface imersiva que segue a estética do universo.

## Funcionalidades

- **Autenticação** — Login e cadastro via email/senha (Supabase Auth)
- **Dashboard** — Grid visual de todos os seus personagens
- **Wizard de Criação** — Assistente passo a passo para criar fichas
- **Fichas de Personagem** — Visualização completa com atributos, habilidades e inventário
- **Campanhas** — Crie e gerencie campanhas com seus jogadores
- **Escudo do Mestre** — Painel exclusivo para o mestre com informações privadas
- **Rolagem de Dados** — Sistema de dados integrado com animações

## Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16 | Framework React (App Router) |
| **React** | 19 | UI Library |
| **Supabase** | 2 | Auth + Banco de Dados (PostgreSQL) |
| **Zustand** | 5 | Gerenciamento de Estado |
| **Tailwind CSS** | 4 | Estilização |
| **TypeScript** | 5 | Tipagem estática |
| **ESLint** | 9 | Lint |

## Estrutura do Projeto

```
vestigios-system/
├── supabase/
│   └── migrations/            # Migrations SQL do banco
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Redirect para /dashboard
│   │   ├── globals.css        # Estilos globais
│   │   ├── login/             # Página de login
│   │   ├── cadastro/          # Página de cadastro
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Grid de personagens
│   │   │   ├── ficha/
│   │   │   │   ├── nova/      # Wizard de criação
│   │   │   │   └── [id]/      # Visualização da ficha
│   │   │   ├── campanha/      # Gerenciamento de campanhas
│   │   │   ├── mestre/        # Escudo do mestre
│   │   │   └── rolar/         # Rolagem de dados
│   │   └── api/
│   │       └── auth/callback/ # Callback OAuth
│   ├── components/
│   │   ├── ficha/             # Componentes de ficha
│   │   ├── layout/            # Layout do dashboard
│   │   └── ui/                # Componentes reutilizáveis
│   ├── lib/
│   │   ├── supabase/          # Clientes Supabase
│   │   ├── store/             # Zustand stores
│   │   ├── types.ts           # Tipos TypeScript
│   │   ├── constants.ts       # Configurações do jogo
│   │   ├── dice.ts            # Lógica de rolagem
│   │   └── auth-actions.ts    # Server actions de auth
│   └── styles/                # Estilos adicionais
├── middleware.ts               # Middleware de auth
├── eslint.config.mjs
├── next.config.ts
└── package.json
```

## Getting Started

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recomendado) ou npm
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/frosttlink/vestigios-system.git
cd vestigios-system

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute o servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **Project Settings → API** e copie as credenciais

### 2. Variáveis de Ambiente

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Rodar Migrations

No SQL Editor do Supabase, execute o conteúdo de `supabase/migrations/001_schema.sql`.

### 4. Configurar Auth

Em **Authentication → Settings**:
- Desabilite "Confirm email" para cadastro imediato (opcional)
- Confirme que "Email Auth" está habilitado

## Rotas

| Rota | Descrição | Autenticada |
|------|-----------|-------------|
| `/login` | Login com email/senha | Não |
| `/cadastro` | Criar nova conta | Não |
| `/dashboard` | Grid de personagens | Sim |
| `/dashboard/ficha/nova` | Wizard de criação de ficha | Sim |
| `/dashboard/ficha/[id]` | Visualizar ficha do personagem | Sim |
| `/dashboard/campanha` | Lista de campanhas | Sim |
| `/dashboard/campanha/nova` | Criar nova campanha | Sim |
| `/dashboard/campanha/[id]` | Detalhes da campanha | Sim |
| `/dashboard/mestre` | Escudo do mestre | Sim |
| `/dashboard/rolar` | Rolagem de dados | Sim |

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase | Sim |

## Desenvolvimento

```bash
pnpm dev        # Servidor de desenvolvimento
pnpm build      # Build de produção
pnpm start      # Iniciar servidor de produção
pnpm lint       # Verificar código (ESLint)
```

## Licença

Projeto autoral — Todos os direitos reservados.

---

<p align="center">
  <sub>Feito com dedicação para o universo <b>Vestígios</b> 🕯️</sub>
</p>
