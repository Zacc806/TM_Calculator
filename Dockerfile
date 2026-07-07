# syntax=docker/dockerfile:1

# ---- build: install dev deps, produce SPA (dist/) + bundled server (dist-server/server.mjs) ----
FROM node:20-slim AS build
WORKDIR /app
# Copy manifests first so `npm ci` is cached until dependencies change.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:all

# ---- runtime: node + the self-contained bundle only (esbuild inlines every dep) ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    STATIC_ROOT=/app/web \
    PROGRAMS_FILE=/app/data/programs.json \
    LEADS_FILE=/app/data/leads.jsonl \
    SITE_LEADS_FILE=/app/data/site-leads.jsonl
WORKDIR /app
# No node_modules at runtime — server.mjs is a standalone bundle.
COPY --from=build /app/dist-server/server.mjs ./server.mjs
COPY --from=build /app/dist ./web
# /app/data holds the mutable programs.json + leads files (mount a volume here).
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
