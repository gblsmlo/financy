FROM oven/bun:1.3.14 AS dependencies

WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN bun install --frozen-lockfile

FROM dependencies AS build

COPY backend backend

RUN bun run --cwd backend build

FROM oven/bun:1.3.14 AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=bun:bun /app/backend/dist ./dist

USER bun
EXPOSE 3333

CMD ["bun", "dist/server.js"]
