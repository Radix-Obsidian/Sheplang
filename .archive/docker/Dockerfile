# syntax=docker/dockerfile:1

# -----------------------------
# Stage 1: Builder
# -----------------------------
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files to install dependencies
COPY sheplang/packages/*/package.json ./sheplang/packages/
COPY sheplang/packages/cli/package.json ./sheplang/packages/cli/
COPY sheplang/packages/language/package.json ./sheplang/packages/language/
COPY sheplang/packages/runtime/package.json ./sheplang/packages/runtime/
COPY sheplang/packages/compiler/package.json ./sheplang/packages/compiler/
COPY sheplang/packages/transpiler/package.json ./sheplang/packages/transpiler/
COPY adapters/sheplang-to-boba/package.json ./adapters/sheplang-to-boba/

# Install all workspace dependencies with cache mount
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build everything (ShepLang, BobaScript, CLI, etc.)
RUN pnpm run build

# Optional: run verify
# RUN node scripts/verify.js

# -----------------------------
# Stage 2: CLI Runtime Image
# -----------------------------
FROM node:20-alpine AS cli

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy only production dependencies and built artifacts
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nodejs:nodejs /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy compiled output
COPY --from=builder --chown=nodejs:nodejs /app/sheplang ./sheplang
COPY --from=builder --chown=nodejs:nodejs /app/adapters ./adapters

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production

# Default entry for the CLI container
ENTRYPOINT ["node", "sheplang/packages/cli/dist/index.js"]
CMD ["--help"]
