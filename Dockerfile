FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM builder AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM builder AS prod-deps
RUN pnpm install --frozen-lockfile --prod

FROM node:24-slim
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/darts.db WEB_ROOT=/app/dist/web
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./
COPY src/engine ./src/engine
COPY src/contracts ./src/contracts
COPY src/server ./src/server
COPY --from=build /app/dist/web ./dist/web
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "src/server/main.ts"]
