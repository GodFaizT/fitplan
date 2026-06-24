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
# NEXT_PUBLIC_* é embebido no bundle em build-time.
# Default aponta para o backend no subdomínio próprio (apifit.tomasdev.me).
ARG NEXT_PUBLIC_API_URL=https://apifit.tomasdev.me/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Chave pública VAPID (notificações) — embebida no bundle em build-time.
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=BIMOEYPMfrArq4z1T_rd4hK1oqUdOTsNnWCF7uL5gYZ9qHauc2vK1BItagX1nJqcI9mQ_8VZEdBf7jDSo5jlmVo
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
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
