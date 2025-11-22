/**
 * Seed script: Add sample data that persists
 * 
 * Run with: pnpm run seed
 */

import 'dotenv/config';
import { prisma, disconnectDatabase } from './client.js';

async function seed() {
  try {
    console.log('🌱 Seeding database...\n');

    // Create multiple users
    const users = await prisma.user.createMany({
      data: [
        { name: 'Alice Johnson', email: 'alice@sheplang.ai' },
        { name: 'Bob Smith', email: 'bob@sheplang.ai' },
        { name: 'Charlie Brown', email: 'charlie@sheplang.ai' },
      ],
      skipDuplicates: true, // Skip if email already exists
    });

    console.log(`✅ Created ${users.count} users`);

    // Fetch and display all users
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n📚 All users in database:');
    allUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - Created: ${user.createdAt.toISOString()}`);
    });

    console.log('\n✨ Seeding completed successfully!');
    console.log('💡 View in Prisma Studio: pnpm run db:studio\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seed();
