/**
 * CRUD Example: Demonstrates full Create, Read, Update, Delete lifecycle
 * 
 * Run this script with: pnpm run example
 * 
 * Make sure to:
 * 1. Copy .env.example to .env
 * 2. Add your Neon connection string
 * 3. Run: pnpm run db:generate
 * 4. Run: pnpm run db:push
 */

import 'dotenv/config';
import { prisma, disconnectDatabase } from './client.js';

async function main() {
  try {
    console.log('🚀 Starting CRUD operations...\n');

    // CREATE
    console.log('📝 CREATE: Creating a new user...');
    const newUser = await prisma.user.create({
      data: {
        name: 'Alice',
        email: `alice-${Date.now()}@sheplang.ai`,
      },
    });
    console.log('✅ User created:', newUser);
    console.log('');

    // READ (Single)
    console.log('🔍 READ: Finding the user by ID...');
    const foundUser = await prisma.user.findUnique({
      where: { id: newUser.id },
    });
    console.log('✅ User found:', foundUser);
    console.log('');

    // READ (All)
    console.log('📚 READ: Fetching all users...');
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5, // Limit to 5 most recent
    });
    console.log(`✅ Found ${allUsers.length} users (showing up to 5):`);
    allUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    console.log('');

    // UPDATE
    console.log('✏️  UPDATE: Updating the user...');
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: { name: 'Alice Smith' },
    });
    console.log('✅ User updated:', updatedUser);
    console.log('');

    // DELETE
    console.log('🗑️  DELETE: Deleting the user...');
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log('✅ User deleted successfully');
    console.log('');

    console.log('✨ CRUD operations completed successfully!\n');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    console.log('👋 Database disconnected');
  }
}

main();
