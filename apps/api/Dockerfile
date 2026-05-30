FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate --schema=./libs/shared/prisma/schema.prisma
RUN npx nx build api --skip-nx-cache

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/shared/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN mkdir -p uploads
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma && node dist/main.js"]
