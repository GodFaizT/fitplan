# FitPlan

**Self-hosted personal fitness platform: nutrition calculator, meal logging and workout plans in one installable PWA.**

[![CI](https://github.com/GodFaizT/fitplan/actions/workflows/ci.yml/badge.svg)](https://github.com/GodFaizT/fitplan/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-6EE7B7.svg)](./LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

[English](#english) · [Português](#português)

---

## English

FitPlan is a multi-user fitness app you run on your own server. It works out your calorie and macro targets, tracks what you eat, guides your training sessions and shows your progress over time. You keep your own data.

> The interface is currently in **European Portuguese**. Translations are welcome. See [Contributing](#contributing).

### Features

**Nutrition**
- Calorie and macro calculator (Mifflin-St Jeor BMR → TDEE → goal-based targets)
- Meal log with a catalogue of common foods, saved foods, recent foods and "copy previous day"
- Barcode scanner backed by [Open Food Facts](https://world.openfoodfacts.org)
- Optional AI photo analysis: snap a meal and get estimated foods and macros (via OpenRouter)
- Daily water counter

**Training**
- Workout builder with 870+ exercises from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (translated to Portuguese)
- Ready-made 3-day and 5-day plans, plus a weekly schedule
- Guided sessions with a rest timer and progressive-overload suggestions
- Cardio logging and volume per muscle group

**Progress**
- Weight tracking with a goal, body measurements and workout history
- Progress photos with before/after comparison
- Weekly summary with streaks, adherence and a consistency heatmap
- Export all your data

**Platform**
- Installable PWA with push notifications (daily meal reminder)
- Multi-user: the admin approves new accounts
- JWT access and refresh tokens with rotation, httpOnly cookies, rate limiting

### Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, Framer Motion, Recharts |
| Backend  | NestJS, Prisma ORM, JWT (access + refresh), bcrypt, web-push |
| Database | PostgreSQL |
| PWA      | Serwist |
| Deploy   | Docker / Docker Compose (any VPS, e.g. Dokploy) |

It's an npm workspaces monorepo:

```
packages/
  shared/     # domain logic (nutrition): pure functions + types, unit-tested
apps/
  backend/    # NestJS + Prisma REST API
  frontend/   # Next.js PWA
```

### Quick start (Docker)

```bash
git clone https://github.com/GodFaizT/fitplan.git
cd fitplan
cp .env.example .env
# Fill in POSTGRES_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (openssl rand -hex 32)
# and ADMIN_EMAIL (the account you register with becomes the admin)
docker compose up --build
```

Open http://localhost:3000 and register with your `ADMIN_EMAIL`. The exercise library and food catalogue are seeded automatically on first start.

### Local development

Requires Node ≥ 20 and PostgreSQL.

```bash
npm install
npm run build:shared
npm run test:shared

# Backend: copy apps/backend/.env.example to apps/backend/.env and fill it in
npm run prisma:migrate -w @fitplan/backend
npm run dev:backend          # API on :3001

# Frontend: copy apps/frontend/.env.example to apps/frontend/.env.local (in another terminal)
npm run dev:frontend         # app on :3000
```

### Deploy

See [`DEPLOY.md`](./DEPLOY.md) (Portuguese) for production deployment as three services (Postgres, backend, frontend). The full product spec is in [`PROJECT.md`](./PROJECT.md).

### Contributing

Issues and pull requests are welcome. Good places to start:
- i18n / an English UI
- New ready-made workout plans or foods for the catalogue
- Bug reports from your own self-hosted instance

CI runs tests and builds on every PR.

### License

[MIT](./LICENSE) © Tomás Alexandre

---

## Português

O FitPlan é uma app de fitness multi-utilizador que corres no teu próprio servidor. Calcula as tuas metas de calorias e macros, regista o que comes, guia os teus treinos e mostra a tua evolução. Os dados ficam contigo.

### Funcionalidades

- **Nutrição:** calculadora de calorias e macros (Mifflin-St Jeor), registo de refeições, catálogo de alimentos, scanner de código de barras (Open Food Facts), análise de refeições por foto com IA (opcional) e contador de água
- **Treino:** construtor com mais de 870 exercícios em português, planos prontos (3 e 5 dias), agenda semanal, sessão guiada com cronómetro de descanso e sugestões de progressão
- **Progresso:** peso e meta, medidas corporais, fotos antes/depois, resumo semanal com heatmap de consistência e exportação de dados
- **Plataforma:** PWA instalável, notificações push, aprovação de contas pelo admin

### Arranque rápido

```bash
git clone https://github.com/GodFaizT/fitplan.git
cd fitplan
cp .env.example .env   # preenche as passwords, os segredos JWT e o ADMIN_EMAIL
docker compose up --build
```

Abre http://localhost:3000 e regista-te com o `ADMIN_EMAIL`. Para desenvolvimento local, deploy e especificação completa, vê a secção em inglês acima, o [`DEPLOY.md`](./DEPLOY.md) e o [`PROJECT.md`](./PROJECT.md).

Contribuições são bem-vindas. Licença [MIT](./LICENSE).
