# Easy Visa — production image (Next.js standalone + Payload)
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
# Build needs a database URL shape but does not connect for static pages that read data;
# pages that need data are rendered at request time.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG PAYLOAD_SECRET=build-only-secret
ARG NEXT_PUBLIC_SITE_URL=https://easyvisa.example
ENV DATABASE_URL=$DATABASE_URL PAYLOAD_SECRET=$PAYLOAD_SECRET NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# One-off tasks (seed) on the server: source + all dependencies, no build. Not the app image.
#   docker run --rm --network easy-visa-internal ... easy-visa-tools node --import tsx/esm src/seed/run.ts --force
FROM base AS tools
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Uploads live on volumes: public images and PRIVATE customer documents.
RUN mkdir -p media private-uploads && chown nextjs:nodejs media private-uploads
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
