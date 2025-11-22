/**
 * Centralized Prisma Client for ShepLang
 * 
 * This module provides a singleton PrismaClient instance that can be
 * reused across your application to avoid connection pool exhaustion.
 */

import { PrismaClient } from '../generated/prisma/index.js';

// Extend the global type to include our prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client instance
 * 
 * In development, this prevents creating multiple instances during hot reloads.
 * In production, this ensures optimal connection pooling.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Store the instance globally in development to prevent hot reload issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect from the database
 * Call this when shutting down your application
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Check database connection health
 * Useful for health check endpoints
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

export default prisma;
