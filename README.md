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

Pré-requisitos: Node ≥ 20, PostgreSQL.

Em dev local, a base de dados corre num cluster dedicado em **localhost:5433**
(BD `fitplan`). Se não estiver a correr (ex: após reiniciar o PC):

```bash
pwsh -File scripts/start-db.ps1
```

Portas: frontend **3000**, API **3001**, PostgreSQL **5433**.

```bash
npm install                 # instala todas as workspaces
npm run build:shared        # compila o pacote shared
npm run test:shared         # corre os testes da lógica de nutrição (18)

# backend (ver apps/backend/.env)
npm run prisma:migrate -w @fitplan/backend
npm run seed:exercises -w @fitplan/backend   # uma vez (873 exercícios)
npm run dev:backend

# frontend (ver apps/frontend/.env.local) — noutro terminal
npm run dev:frontend
```

## Deploy

Ver [`DEPLOY.md`](./DEPLOY.md) — três serviços no Dokploy (Postgres + backend + frontend),
Dockerfiles em `apps/*/Dockerfile`, ou `docker compose up --build` para teste local.
