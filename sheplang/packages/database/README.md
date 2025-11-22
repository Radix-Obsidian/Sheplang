# @goldensheepai/sheplang-database

Centralized database client for ShepLang applications using **Neon PostgreSQL** and **Prisma ORM**.

## 🎯 Purpose

This package provides a singleton Prisma Client instance that integrates seamlessly with ShepLang's code generator. It uses Neon's serverless Postgres with connection pooling for optimal performance.

## 🚀 Quick Start

### 1. Install Dependencies

From the package directory:

```bash
pnpm install
```

### 2. Configure Database Connection

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and add your Neon connection string:

```env
DATABASE_URL="postgresql://[user]:[password]@[neon_hostname]-pooler/[dbname]?sslmode=require"
```

**Where to find your connection string:**
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click **"Connection Details"**
4. Copy the **"Pooled connection"** string
5. Paste it into `.env`

### 3. Generate Prisma Client

```bash
pnpm run db:generate
```

This generates the Prisma Client based on your schema.

### 4. Push Schema to Database

```bash
pnpm run db:push
```

This creates the tables in your Neon database.

### 5. Run the Example

```bash
pnpm run example
```

This runs a full CRUD (Create, Read, Update, Delete) demonstration.

## 📦 Usage

### In Your Code

```typescript
import { prisma } from '@goldensheepai/sheplang-database';

// Create
const user = await prisma.user.create({
  data: {
    name: 'Alice',
    email: 'alice@example.com',
  },
});

// Read
const users = await prisma.user.findMany();

// Update
const updated = await prisma.user.update({
  where: { id: user.id },
  data: { name: 'Alice Smith' },
});

// Delete
await prisma.user.delete({
  where: { id: user.id },
});
```

### In Generated API Routes

Your ShepLang compiler already generates code that uses this pattern:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

**To use the centralized client instead**, update your compiler to generate:

```typescript
import { prisma } from '@goldensheepai/sheplang-database';
```

This avoids creating multiple Prisma Client instances and improves connection pooling.

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Compile TypeScript to JavaScript |
| `pnpm run dev` | Watch mode for development |
| `pnpm run clean` | Remove build artifacts |
| `pnpm run typecheck` | Type-check without emitting files |
| `pnpm run db:generate` | Generate Prisma Client from schema |
| `pnpm run db:push` | Push schema changes to database |
| `pnpm run db:migrate` | Create and apply migrations |
| `pnpm run db:studio` | Open Prisma Studio (database GUI) |
| `pnpm run example` | Run the CRUD example script |

## 📁 Project Structure

```
database/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── client.ts              # Singleton Prisma Client
│   ├── index.ts               # Package exports
│   └── example.ts             # CRUD example
├── generated/
│   └── prisma/                # Generated Prisma Client (auto-generated)
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Integration with ShepLang Compiler

Your compiler (`packages/compiler`) already generates Prisma schemas and API routes. To integrate this database package:

### Option 1: Update Compiler Templates

Modify `packages/compiler/src/api-templates.ts`:

```typescript
// Instead of:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Generate:
import { prisma } from '@goldensheepai/sheplang-database';
```

### Option 2: Use for Manual Projects

For projects not using the code generator, import this package directly in your Express routes or serverless functions.

## 🌐 Neon PostgreSQL

This package is optimized for **Neon's serverless Postgres**:

- ✅ **Connection Pooling**: Uses Neon's built-in PgBouncer
- ✅ **Auto-scaling**: Scales to zero when inactive
- ✅ **Branching**: Create database branches for development
- ✅ **Point-in-time Recovery**: Built-in backups

## 🔐 Security Best Practices

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use environment variables for connection strings
- ✅ Use connection pooling in production (`-pooler` in connection string)
- ✅ Enable SSL mode (`sslmode=require`)

## 📚 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [ShepLang Documentation](../../README.md)

## 🐛 Troubleshooting

### "Can't reach database server"

- ✅ Check your `DATABASE_URL` is correct
- ✅ Ensure your Neon project is active
- ✅ Verify you're using the **pooled connection** string (contains `-pooler`)

### "Module not found: @prisma/client"

- ✅ Run `pnpm run db:generate` to generate the Prisma Client
- ✅ Run `pnpm install` to install dependencies

### "Table does not exist"

- ✅ Run `pnpm run db:push` to create tables
- ✅ Or run `pnpm run db:migrate` to use migrations

## 📄 License

MIT License - Part of the ShepLang project by Golden Sheep AI
