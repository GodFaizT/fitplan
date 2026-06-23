# Deploy no Dokploy

Três serviços num VPS com Dokploy (PROJECT.md secção 12). HTTPS é tratado
automaticamente pelo Traefik + Let's Encrypt ao associar domínios.

## 1. PostgreSQL

- Cria uma base de dados **PostgreSQL** (template do Dokploy) com **volume persistente**.
- Guarda a connection string → é o `DATABASE_URL` do backend.
- Configura backups agendados (Dokploy suporta para S3/local).

## 2. Backend (NestJS)

Aplicação a partir do Git, build pelo `apps/backend/Dockerfile` (build context = raiz do repo).

Variáveis de ambiente:

| Variável | Exemplo |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@postgres:5432/fitplan?schema=public` |
| `JWT_ACCESS_SECRET` | (gerar aleatório longo) |
| `JWT_REFRESH_SECRET` | (gerar aleatório longo, diferente) |
| `JWT_ACCESS_TTL` | `15m` |
| `JWT_REFRESH_TTL_DAYS` | `30` |
| `CORS_ORIGIN` | `https://app.oteudominio.com` (o domínio do frontend, **nunca** `*`) |
| `PORT` | `3001` |
| `USE_REFRESH_COOKIE` | `true` |

- O Dockerfile corre `prisma migrate deploy` no arranque.
- Associa um subdomínio (ex: `api.oteudominio.com`).
- **Seeds (uma vez):** após o primeiro deploy, corre numa shell com o
  `DATABASE_URL` de produção:
  ```bash
  npm run seed:exercises -w @fitplan/backend   # biblioteca de exercícios (873)
  npm run seed:foods -w @fitplan/backend        # catálogo de alimentos comuns (54)
  ```
  (Podes corrê-los a partir da tua máquina apontando `DATABASE_URL` para a BD de produção.)

## 3. Frontend (Next.js)

Aplicação a partir do Git, build pelo `apps/frontend/Dockerfile`.

- **Build arg** `NEXT_PUBLIC_API_URL` = `https://api.oteudominio.com/api`
  (é embebido no bundle em build-time, por isso tem de ser um *build arg*, não só env de runtime).
- Associa o domínio principal (ex: `app.oteudominio.com`) com HTTPS.

## Notas

- **Cookie do refresh token:** o frontend e o backend devem partilhar um domínio-pai
  (ex: `app.` e `api.` do mesmo domínio) para o cookie httpOnly funcionar entre eles.
- **CORS:** define `CORS_ORIGIN` para o domínio exato do frontend (com cookies não se usa `*`).
- **HTTPS** é obrigatório para a PWA (service worker) — garantido pelo Dokploy ao associar domínios.
- Testa a instalação real em iPhone (Safari) e Android (Chrome) antes de dar como concluído.

## Teste local com Docker

```bash
# define os segredos em .env na raiz (POSTGRES_PASSWORD, JWT_*), depois:
docker compose up --build
# frontend em http://localhost:3000, API em http://localhost:3001/api
# correr o seed uma vez:
docker compose exec backend npm run seed:exercises -w @fitplan/backend
```
