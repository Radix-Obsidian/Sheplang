/**
 * @goldensheepai/sheplang-database
 * 
 * Centralized database client for ShepLang applications using Neon and Prisma.
 * 
 * Usage:
 * ```typescript
 * import { prisma } from '@goldensheepai/sheplang-database';
 * 
 * const users = await prisma.user.findMany();
 * ```
 */

export { prisma, disconnectDatabase, checkDatabaseConnection } from './client.js';
export type { PrismaClient } from '../generated/prisma/index.js';

// Re-export Prisma types for convenience
export type * from '../generated/prisma/index.js';
