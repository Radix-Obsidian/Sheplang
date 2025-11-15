# Shipyard Deployment Model (for Non-Technical Founders)

**Context:** Shipyard is a sandbox IDE where founders build full-stack MVPs using ShepLang (frontend) + ShepThon (backend).

**Problem:** Non-technical founders cannot be handed "a repo" and told to figure out deployment.

**Solution:** Shipyard must own the deployment story end-to-end.

---

## Three Levels of Deployment

Think of three levels:

1. **"It just runs"** (built-in hosting) → for 100% non-technical users
2. **"Let my devs take over"** (export code) → for teams / YC / agencies
3. **"Pro mode"** (one-click Vercel later) → future, once Alpha is stable

**Alpha = Level 1 + Level 2.**

No sending people to AWS/Vercel docs. No npm packaging. No "figure it out."

---

## 1️⃣ For Your Actual Users: "Publish" = Live URL (You Host It)

### What the Founder Sees in Shipyard

In the UI, when they're happy with their MVP:

**A single button: "Publish MVP"**

Under it, three options:
- ✅ **Share link** (recommended)  
  `https://USERNAME.shipyard.run/my-mvp`
- 🔐 **Private test link** (not indexed, maybe password)
- 📦 **Export code** (for developers)

---

### They Click "Share Link" → Shipyard Does All the Hard Stuff:

1. **Freezes a snapshot of:**
   - ShepLang frontend
   - ShepThon backend
   - Any config (jobs, endpoints)

2. **Compiles it internally:**
   - ShepLang → BobaScript → JS/TS runtime
   - ShepThon → Node backend handlers

3. **Builds & runs it inside your infra:**
   - Docker container or multi-tenant runtime

4. **Returns a live URL.**

---

### From Their POV:

"I built an MVP and it's live on the internet. I can send this to users, YC partners, my friends."

**They never see:**
- "Deploy from GitHub"
- "Set Root Directory"
- "What is Vercel / AWS / Railway?"

You and I know under the hood you might use:
- Vercel
- Railway
- Render
- Fly.io
- Your own Docker cluster

…but that's **implementation detail**.

**To them it's just: Shipyard → "Publish" → live URL.**

---

## 2️⃣ For Dev Teams: Export the Generated App (Not npm Package)

### Your Question:

"Do they package it as an npm (to test inside the sandbox) or export the code base and then take it somewhere else?"

**For an app, npm is the wrong mental model.**

npm is ideal for:
- libraries
- SDKs
- reusable components

**Your users want:**
- a web app they can visit
- or source code their dev can fork

---

### So Shipyard Should Offer:

**"Export Code" → Download or GitHub**

When they click **Export code:**

1. Shipyard compiles the project into a plain **Next.js or Node app** (whatever we standardize on).

2. They get:
   - either a `.zip` download, or
   - a **"Push to GitHub" wizard** that creates a repo like `username/my-shipyard-app` with:
     - `package.json`
     - `next.config` / `server.ts` / etc.
     - `README_ShipyardExport.md` with deployment steps (Vercel / Railway / etc.)

---

### This Is For:

- founders who now hire devs
- YC partners who want to see "real code"
- agencies who will "harden" the MVP

They still don't have to touch Vercel themselves if they don't want to, but now the path is clear.

---

## 3️⃣ Later: "Deploy to Vercel" Button (Pro Mode)

This is **future, not Alpha**, but we can aim for it:

**In the Export menu, add:**
- "Deploy to Vercel"

**Behind the scenes:**
- Use Vercel API to:
  - create a project
  - upload/build the compiled app
  - get back a URL
- Show progress in Shipyard.

This is where you might integrate the **Vercel AI SDK** to build a deployment agent later, but we don't need that in Sandbox Alpha.

---

## So What Does Alpha Actually Do?

### For Sandbox / Shipyard Alpha:

#### ✅ MUST HAVE

**Built-in hosting / preview:**
- Every project runs inside Shipyard while they build.
- "Run"/"Preview" is instant.

**"Publish MVP" → shareable URL:**
- On click, snapshot + build + run on your infra.
- They copy a URL and share.

**"Export Code":**
- Generate a clean project (Next.js/Node) from ShepLang + ShepThon.
- Provide a README with deployment instructions for developers (Vercel / Railway / etc).

#### ❌ NOT in Alpha

- No manual "go sign up for AWS and follow these 37 steps" flow.
- No npm package per user app.
- No requirement to understand Vercel, Docker, etc.

---

## How This Feels in a User Story

> "I came in knowing nothing.  
> After a week I had a working app inside Shipyard.  
> I clicked **Publish** and got a link.  
> My friends used it from their phones.  
> Then I hired a dev — I hit **Export Code**, sent them the repo, and they took it from there."

**That's the magic for a non-technical founder:**
- They experience "I shipped."
- You handle the messy world of infra.

---

## Founder Takeaways

- Non-technical founders should never be left holding a raw repo. **Shipyard must give them a live URL.**

- Don't use npm as the deploy story for apps; use:
  - built-in hosting +
  - exportable, standard web app code.

- **Alpha scope:**
  - In-Shipyard hosting + Publish + Export.
  - No external platform docs.

- **Later, we can layer in:**
  - "Deploy to Vercel" for pros
  - more advanced DevOps hooks.
