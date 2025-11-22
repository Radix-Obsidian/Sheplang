# 🚀 Quick Start - 3 Minutes to Database

## ⚡ TL;DR

```bash
# 1. Add your Neon connection string to .env
# 2. Generate Prisma Client
pnpm run db:generate

# 3. Push schema to database
pnpm run db:push

# 4. Test it works
pnpm run example
```

---

## 📋 Step-by-Step

### Step 1: Get Connection String (1 minute)

1. Open [Neon Console](https://console.neon.tech)
2. Click your **"ShepLang"** project
3. Click **"Connection Details"**
4. Copy the **"Pooled connection"** string (contains `-pooler`)

### Step 2: Update .env (30 seconds)

Open `sheplang/packages/database/.env` and paste your connection string:

```env
DATABASE_URL="postgresql://neondb_owner:npg_xxxxx@ep-steep-clouds-a1b2c3d4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Generate Client (30 seconds)

```bash
cd sheplang/packages/database
pnpm run db:generate
```

You should see:
```
✔ Generated Prisma Client (v6.19.0)
```

### Step 4: Create Tables (30 seconds)

```bash
pnpm run db:push
```

You should see:
```
🚀 Your database is now in sync with your Prisma schema.
```

### Step 5: Test It (30 seconds)

```bash
pnpm run example
```

You should see:
```
🚀 Starting CRUD operations...
✅ CREATE: User created
✅ READ: User found
✅ UPDATE: User updated
✅ DELETE: User deleted
✨ CRUD operations completed successfully!
```

---

## ✅ Success!

Your database is ready to use. You can now:

- Import the client: `import { prisma } from '@goldensheepai/sheplang-database'`
- Use Prisma Studio: `pnpm run db:studio`
- Update your compiler: See `COMPILER_INTEGRATION.md`

---

## 🆘 Problems?

See `SETUP_GUIDE.md` for troubleshooting.
