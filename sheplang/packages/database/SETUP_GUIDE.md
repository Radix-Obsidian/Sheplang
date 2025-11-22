# 🚀 Neon + Prisma Database Setup Guide

## ✅ What's Already Done

- ✅ Database package created at `sheplang/packages/database`
- ✅ All dependencies installed (Prisma, TypeScript, etc.)
- ✅ Workspace configuration updated
- ✅ Sample User schema created
- ✅ CRUD example script ready
- ✅ `.env` file created (needs your connection string)

---

## 📋 Next Steps (3 minutes)

### Step 1: Get Your Neon Connection String

Based on your screenshots, you already have a Neon project called **"ShepLang"**. Here's how to get the connection string:

1. Go to [Neon Console](https://console.neon.tech)
2. Click on your **"ShepLang"** project
3. Click **"Connection Details"** (or the "Connect" button)
4. Look for the **"Pooled connection"** string (it will contain `-pooler`)
5. Copy the entire connection string

It should look like this:
```
postgresql://neondb_owner:npg_xxxxx@ep-steep-clouds-a1b2c3d4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Update Your .env File

1. Open `sheplang/packages/database/.env`
2. Replace the placeholder connection string with your actual one
3. Save the file

**Example:**
```env
DATABASE_URL="postgresql://neondb_owner:npg_AbCdEfGhIjKlMnOp@ep-steep-clouds-a1b2c3d4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Generate Prisma Client

From the `sheplang/packages/database` directory, run:

```bash
pnpm run db:generate
```

This will:
- Read your `prisma/schema.prisma` file
- Generate TypeScript types based on your schema
- Create the Prisma Client in `generated/prisma/`

Expected output:
```
✔ Generated Prisma Client (v6.19.0) to ./generated/prisma
```

### Step 4: Push Schema to Database

This creates the `User` table in your Neon database:

```bash
pnpm run db:push
```

Expected output:
```
🚀 Your database is now in sync with your Prisma schema.
```

### Step 5: Run the CRUD Example

Test the connection with a full Create-Read-Update-Delete demonstration:

```bash
pnpm run example
```

Expected output:
```
🚀 Starting CRUD operations...

📝 CREATE: Creating a new user...
✅ User created: { id: '...', name: 'Alice', email: 'alice-...@sheplang.ai' }

🔍 READ: Finding the user by ID...
✅ User found: { id: '...', name: 'Alice', email: 'alice-...@sheplang.ai' }

📚 READ: Fetching all users...
✅ Found 1 users (showing up to 5):
  - Alice (alice-...@sheplang.ai)

✏️  UPDATE: Updating the user...
✅ User updated: { id: '...', name: 'Alice Smith', email: 'alice-...@sheplang.ai' }

🗑️  DELETE: Deleting the user...
✅ User deleted successfully

✨ CRUD operations completed successfully!

👋 Database disconnected
```

---

## 🎯 Using the Database Package

### In Your Code

Import the centralized Prisma client:

```typescript
import { prisma } from '@goldensheepai/sheplang-database';

// Create
const user = await prisma.user.create({
  data: {
    name: 'Bob',
    email: 'bob@example.com',
  },
});

// Read
const users = await prisma.user.findMany();

// Update
const updated = await prisma.user.update({
  where: { id: user.id },
  data: { name: 'Bob Smith' },
});

// Delete
await prisma.user.delete({
  where: { id: user.id },
});
```

### Integration with Your Compiler

Your compiler (`packages/compiler`) currently generates API routes like this:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Recommended Change:** Update your compiler templates to use the centralized client:

**File:** `packages/compiler/src/api-templates.ts`

**Find:**
```typescript
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
```

**Replace with:**
```typescript
import { prisma } from '@goldensheepai/sheplang-database';

const router = Router();
```

**Benefits:**
- ✅ Avoids creating multiple Prisma Client instances
- ✅ Better connection pooling
- ✅ Centralized configuration
- ✅ Easier to maintain

---

## 🔧 Available Commands

From `sheplang/packages/database`:

| Command | Description |
|---------|-------------|
| `pnpm run build` | Compile TypeScript to JavaScript |
| `pnpm run dev` | Watch mode for development |
| `pnpm run clean` | Remove build artifacts |
| `pnpm run typecheck` | Type-check without emitting files |
| `pnpm run db:generate` | Generate Prisma Client from schema |
| `pnpm run db:push` | Push schema changes to database |
| `pnpm run db:migrate` | Create and apply migrations |
| `pnpm run db:studio` | Open Prisma Studio (database GUI) |
| `pnpm run example` | Run the CRUD example script |

---

## 🎨 Prisma Studio (Database GUI)

Want to visually browse your database? Run:

```bash
pnpm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables and data
- Create, edit, and delete records
- Run queries
- Explore relationships

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solution:**
- ✅ Check your `DATABASE_URL` in `.env`
- ✅ Ensure it's the **pooled connection** string (contains `-pooler`)
- ✅ Verify your Neon project is active (not paused)
- ✅ Check your internet connection

### Error: "Environment variable not found: DATABASE_URL"

**Solution:**
- ✅ Make sure `.env` file exists in `sheplang/packages/database/`
- ✅ Verify `DATABASE_URL` is set in `.env`
- ✅ Don't add quotes around the value unless they're part of the string

### Error: "Table does not exist"

**Solution:**
- ✅ Run `pnpm run db:push` to create tables
- ✅ Or run `pnpm run db:migrate` to use migrations

### Error: "Prisma Client is not generated"

**Solution:**
- ✅ Run `pnpm run db:generate` to generate the Prisma Client

---

## 📚 Next Steps

1. **Update Compiler Templates** - Modify `api-templates.ts` to use the centralized database client
2. **Build the Package** - Run `pnpm run build` from the database directory
3. **Test Integration** - Generate a ShepLang app and verify it uses the database package
4. **Add to CI/CD** - Include database package in your build/test pipelines

---

## 🔐 Security Checklist

- ✅ `.env` is in `.gitignore` (never commit database credentials)
- ✅ Use environment variables for connection strings
- ✅ Use pooled connections in production (`-pooler` in connection string)
- ✅ Enable SSL mode (`sslmode=require`)
- ✅ Rotate database passwords regularly
- ✅ Use Neon's branching feature for development databases

---

## 📖 Learn More

- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs
- **ShepLang GitHub:** https://github.com/Radix-Obsidian/Sheplang-BobaScript

---

**Status:** 🎉 **READY TO USE!**

Just complete Steps 1-5 above and you're all set!
