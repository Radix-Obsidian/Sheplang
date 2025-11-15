# ⚡ ShepYard Quick Start Guide

**Get up and running in under 5 minutes!**

---

## ⏱️ 5-Minute Setup

### Step 1: Prerequisites (1 minute)

**Check if you have Node.js:**
```bash
node --version
# Need v18 or higher
```

**Don't have Node.js?**  
👉 Download: https://nodejs.org/ (choose LTS version)

**Install pnpm:**
```bash
npm install -g pnpm
```

---

### Step 2: Installation (2 minutes)

```bash
# Navigate to shepyard directory
cd shepyard

# Install dependencies (this takes ~1-2 minutes)
pnpm install
```

☕ Grab a coffee while dependencies install...

---

### Step 3: Launch ShepYard (1 minute)

```bash
# Start the development server
pnpm dev
```

**You should see:**
```
VITE v5.4.21  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 4: Open in Browser (30 seconds)

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the ShepYard interface!

---

### Step 5: Try It Out! (30 seconds)

**Click on an example:**
1. Look at the left sidebar
2. Click **"Todo List"**
3. Watch the code appear in the center
4. See the live preview on the right
5. Read the explanation below!

🎉 **You're done! That's ShepYard in action.**

---

## 🎯 Next Steps

### Explore Examples

Try all three built-in examples:
- **Todo List** - Simple task manager
- **Dog Care Reminder** - Pet care tracking
- **Multi-Screen Navigation** - Multi-page app

### Customize Your Workspace

**Resize panels:**
- Drag the vertical bars to resize

**Hide panels:**
- Click "Hide Sidebar" (top-left)
- Click "Hide Preview" (top-right)

**Collapse sections:**
- Click "Live Preview" header
- Click "Explain" header

### Run Tests

```bash
# See that everything works
pnpm test
```

Expected: **32 tests passing** ✅

---

## 🐛 Common Issues

### "Port 5173 already in use"

**Solution:**
```bash
# Use a different port
pnpm dev --port 3000
```

### Dependencies won't install

**Solution:**
```bash
# Clear cache and retry
pnpm store prune
pnpm install
```

### "Module not found" error

**Solution:**
```bash
# Reinstall from scratch
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## ✅ Verify Everything Works

From the **root** of the Sheplang repository:

```bash
cd ..  # Go back to Sheplang root
pnpm run verify
```

**Expected output:**
```
=== VERIFY OK ===
```

If you see this, everything is working perfectly! 🎉

---

## 📚 Learn More

- **README.md** - Full documentation
- **PHASE[1-5]_COMPLETE.md** - Implementation details
- **src/examples/exampleList.ts** - Example ShepLang code

---

## 🆘 Need Help?

**Check the logs:**
- Browser console (F12)
- Terminal output

**Common fixes:**
1. Restart the dev server (`Ctrl+C`, then `pnpm dev`)
2. Clear browser cache
3. Reinstall dependencies

---

**🐑 Happy coding with ShepYard!**

_Time to complete: ~5 minutes_ ⏱️
