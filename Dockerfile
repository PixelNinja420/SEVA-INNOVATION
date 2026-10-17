FROM node:20-alpine AS builder

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./
COPY server/src/database/schema.sql ./src/database/schema.sql

RUN mkdir -p ./data

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=./data/urja-sync.db

EXPOSE 3001
CMD ["node", "dist/index.js"]
