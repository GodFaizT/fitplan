# Frontend Next.js — imagem standalone para Dokploy. Build context = raiz do monorepo.
# PROJECT.md secção 12.3.

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci
COPY packages/shared packages/shared
RUN npm run build -w @fitplan/shared
COPY apps/frontend apps/frontend
# URL da API e chave VAPID não são embebidos no build: o frontend lê-os em
# runtime das variáveis de ambiente API_URL e VAPID_PUBLIC_KEY (servidas em
# /env.js). A mesma imagem serve qualquer domínio.
RUN npm run build -w @fitplan/frontend

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
# Cache com escrita para o utilizador não-root, e corre como `node` (não-root).
RUN mkdir -p apps/frontend/.next/cache && chown -R node:node apps/frontend/.next/cache
USER node
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
