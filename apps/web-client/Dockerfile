FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

ARG NEXT_PUBLIC_API_URL=https://api.afroeventos.com/api
ARG NEXT_PUBLIC_SITE_URL=https://afroeventos.com
ARG NEXT_PUBLIC_HOST_URL=https://host.afroeventos.com
ARG NEXT_PUBLIC_ADMIN_URL=https://admin.afroeventos.com
ARG NEXT_PUBLIC_MAX_UPLOAD_MB=2.5
ARG NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_HOST_URL=$NEXT_PUBLIC_HOST_URL
ENV NEXT_PUBLIC_ADMIN_URL=$NEXT_PUBLIC_ADMIN_URL
ENV NEXT_PUBLIC_MAX_UPLOAD_MB=$NEXT_PUBLIC_MAX_UPLOAD_MB
ENV NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=$NEXT_PUBLIC_ALLOWED_IMAGE_TYPES

RUN npx nx build web-client --skip-nx-cache

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/web-client/.next/standalone ./
COPY --from=builder /app/dist/apps/web-client/.next/static ./apps/web-client/.next/static
COPY --from=builder /app/apps/web-client/public ./apps/web-client/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web-client/server.js"]
