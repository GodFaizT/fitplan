# FitPlan

Plataforma de fitness pessoal — calculadora de nutrição, registo de refeições e planos de treino. PWA multi-utilizador, self-hosted.

Especificação completa: [`PROJECT.md`](./PROJECT.md).

## Estrutura (monorepo npm workspaces)

```
packages/
  shared/        # lógica de domínio (nutrição) — funções puras + tipos, partilhadas
apps/
  backend/       # NestJS + Prisma + PostgreSQL — API REST, auth JWT
  frontend/      # Next.js (App Router) + Tailwind + shadcn/ui — PWA
```

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Frontend  | Next.js 14+ (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, Framer Motion, recharts |
| Backend   | NestJS, Prisma ORM, JWT (access + refresh), bcrypt |
| BD        | PostgreSQL |
| PWA       | @serwist/next |
| Deploy    | Dokploy (VPS) |

## Desenvolvimento

Pré-requisitos: Node ≥ 20, PostgreSQL a correr localmente.

```bash
npm install                 # instala todas as workspaces
npm run build:shared        # compila o pacote shared
npm run test:shared         # corre os testes da lógica de nutrição

# backend (ver apps/backend/.env.example)
npm run prisma:migrate
npm run seed:exercises
npm run dev:backend

# frontend (ver apps/frontend/.env.example)
npm run dev:frontend
```
