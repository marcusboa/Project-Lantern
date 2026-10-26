# Project Lantern: the built app, card API and Studio in one container.
# Cards and uploaded diagrams live in /data; mount a volume there to keep them.

FROM node:22-bookworm-slim AS build
WORKDIR /app
# better-sqlite3 falls back to compiling from source when no prebuilt binary matches.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    LANTERN_DATA_DIR=/data
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:8787/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node_modules/.bin/tsx", "server/index.ts"]
