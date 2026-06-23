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
# Default RELATIVO "/api" → mesma origem (path-based). Para subdomínios
# separados, passar o URL absoluto como build-arg.
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
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
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
