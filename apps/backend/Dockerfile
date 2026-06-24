# Backend NestJS — imagem para Dokploy. Build context = raiz do monorepo.
# PROJECT.md secção 12.2.

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN npm ci
COPY packages/shared packages/shared
RUN npm run build -w @fitplan/shared
COPY apps/backend apps/backend
RUN npm run prisma:generate -w @fitplan/backend
RUN npm run build -w @fitplan/backend

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN npm ci --omit=dev
# artefactos compilados + cliente Prisma gerado
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/apps/backend/prisma apps/backend/prisma
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/prisma node_modules/prisma
COPY --from=build /app/node_modules/@prisma node_modules/@prisma
# Corre como utilizador não-root (o utilizador `node` já existe na imagem oficial).
USER node
EXPOSE 3001
# Aplica as migrações e arranca a API. Correr o seed dos exercícios uma vez
# (ver DEPLOY.md): npm run seed:exercises -w @fitplan/backend
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy --schema apps/backend/prisma/schema.prisma && node apps/backend/dist/main.js"]
