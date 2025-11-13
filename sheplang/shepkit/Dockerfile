# syntax=docker/dockerfile:1

# -----------------------------
# Stage 1: Dependencies
# -----------------------------
FROM node:20-alpine AS deps

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace package.json files
COPY sheplang/packages/*/package.json ./sheplang/packages/
COPY sheplang/shepkit/package.json ./sheplang/shepkit/
COPY adapters/sheplang-to-boba/package.json ./adapters/sheplang-to-boba/

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------
# Stage 2: Builder
# -----------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy source code
COPY . .

# Build workspace dependencies first
RUN pnpm run build

# Build ShepKit with Next.js telemetry disabled
WORKDIR /app/sheplang/shepkit
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# -----------------------------
# Stage 3: Production Runtime
# -----------------------------
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/sheplang/shepkit/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/sheplang/shepkit/.next/static ./sheplang/shepkit/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/sheplang/shepkit/public ./sheplang/shepkit/public

# Switch to non-root user
USER nextjs

# Expose Next.js port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js production server
CMD ["node", "sheplang/shepkit/server.js"]
