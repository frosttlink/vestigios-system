# Setup do Supabase

## 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie um novo projeto
2. Pegue as credenciais em **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configurar variáveis de ambiente

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<sua-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

## 3. Rodar migrations

No SQL Editor do Supabase, execute o conteúdo de `supabase/migrations/001_schema.sql`.

## 4. Configurar Authentication

Em **Authentication → Settings**:
- Desabilite "Confirm email" se quiser cadastro imediato
- Em "Email Auth", confirme que está habilitado

## 5. Deploy na Vercel

```bash
# Adicione as variáveis de ambiente no projeto Vercel:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Estrutura do Projeto

```
vestigios-system/
├── proxy.ts                    # Proxy para auth (substitui middleware)
├── supabase/migrations/        # Schema SQL
├── src/
│   ├── app/
│   │   ├── login/              # Página de login
│   │   ├── cadastro/           # Página de cadastro
│   │   ├── dashboard/          # Dashboard (autenticado)
│   │   │   ├── page.tsx        # Grid de personagens
│   │   │   ├── ficha/
│   │   │   │   ├── nova/       # Wizard de criação
│   │   │   │   └── [id]/       # Visualização da ficha
│   │   │   ├── campanha/       # Gerenciamento de campanhas
│   │   │   ├── mestre/         # Escudo do mestre
│   │   │   └── rolar/          # Rolagem de dados
│   │   └── api/auth/callback/  # Callback OAuth
│   ├── components/
│   │   ├── ficha/
│   │   │   ├── character-grid.tsx
│   │   │   └── character-sheet-view.tsx
│   │   └── layout/
│   │       └── dashboard-layout.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts       # Cliente browser
│       │   ├── server.ts       # Cliente server
│       │   └── middleware.ts   # Cliente proxy
│       ├── store/
│       │   └── auth-store.ts
│       ├── types.ts            # Tipos do sistema
│       ├── constants.ts        # Config do jogo
│       ├── dice.ts             # Lógica de rolagem
│       └── auth-actions.ts     # Server actions
```

## Rotas

| Rota | Descrição |
|---|---|
| `/login` | Login com email/senha |
| `/cadastro` | Criar conta |
| `/dashboard` | Grid de personagens |
| `/dashboard/ficha/nova` | Wizard de criação |
| `/dashboard/ficha/[id]` | Ficha do personagem |
| `/dashboard/campanha` | Lista de campanhas |
| `/dashboard/campanha/nova` | Criar campanha |
| `/dashboard/campanha/[id]` | Detalhes da campanha |
| `/dashboard/mestre` | Escudo do mestre |
| `/dashboard/rolar` | Rolagem de dados |
