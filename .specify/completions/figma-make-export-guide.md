# Figma Make Export Guide

**Source:** Official Figma Help Center  
**Last Updated:** November 20, 2025  
**Status:** Verified ✅

---

## Export Process

### Method 1: Download as ZIP (Primary)

1. Open your Figma Make project
2. Switch to **Code** view (top of interface)
3. Click **"Download code"** button (upper-right corner of code editor)
4. Figma Make creates a `.zip` file with all project files
5. Download the `.zip` to your computer
6. Unzip the archive
7. Import to your IDE (VS Code, WebStorm, etc.)

**Who can use:** Full seats or Dev seats on paid plans

### Method 2: Push to GitHub (Alternative)

1. In Figma Make, use the **"Push to GitHub"** feature
2. Figma creates a repository in your GitHub account
3. Code is pushed automatically to the repo
4. Clone the repo locally and work in your IDE

---

## What's in the ZIP?

Figma Make exports a **complete, runnable project**:

```
figma-make-project.zip
├── package.json          # Dependencies (Next.js, React, etc.)
├── tsconfig.json         # TypeScript config
├── next.config.js        # Next.js config
├── app/                  # App Router (Next.js 13+)
│   ├── page.tsx
│   ├── layout.tsx
│   └── [routes]/
├── components/           # React components
│   └── *.tsx
├── lib/                  # Utils and helpers
├── public/               # Static assets
└── styles/               # CSS/styling
```

**Key Points:**
- ✅ Full Next.js project structure
- ✅ TypeScript configured
- ✅ All dependencies listed
- ✅ Ready to run with `npm install` + `npm run dev`
- ✅ Production-ready code

---

## Stack Detection

Figma Make always generates:
- **Framework:** Next.js (latest version)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (default)
- **UI Components:** shadcn/ui or custom components

**This is PERFECT for ShepLang's Next.js importer!**

---

## ShepLang Import Workflow

### Step 1: Export from Figma Make
```
1. Build your app in Figma Make
2. Click "Download code" → Save ZIP
3. Unzip to a folder
```

### Step 2: Import to ShepLang
```
1. Open VS Code
2. Command Palette → "ShepLang: Import from Next.js/React Project"
3. Select unzipped folder
4. Follow wizard to refine entities/views/actions
5. Get generated .shep file
```

### Step 3: Extend in ShepLang
```
1. Review generated ShepLang code
2. Fill in TODO comments
3. Add business logic
4. Deploy with ShepThon backend
```

---

## Example: Food Delivery App

### In Figma Make:
```
"Build a food delivery app with restaurants, menu items, 
and cart functionality"
```

**Figma Make generates:**
- Next.js project with TypeScript
- Restaurant listing page
- Menu detail pages
- Shopping cart
- Checkout flow

### Export & Import:
1. Download code → `food-delivery-app.zip`
2. Unzip to `food-delivery-app/`
3. ShepLang import → `FoodDeliveryApp.shep`

**Result:** Clean ShepLang code with:
- `data Restaurant`, `data MenuItem`, `data Order`
- `view RestaurantList`, `view MenuPage`, `view Cart`
- `action AddToCart`, `action PlaceOrder`, `action Checkout`

---

## Limitations & Workarounds

### Limitation: No Prisma by Default
Figma Make doesn't always include Prisma schema.

**Workaround:**
- ShepLang importer will **infer entities from components**
- Wizard lets you **manually add entities**
- Or add `prisma/schema.prisma` before importing

### Limitation: Changes Don't Sync Back
After downloading, changes in your IDE don't sync to Figma Make.

**Workaround:**
- Consider Figma Make the **prototype/design phase**
- ShepLang is the **graduation/production phase**
- Once you import to ShepLang, continue development there

---

## Official Documentation Links

- [Edit the code of a functional prototype or web app](https://help.figma.com/hc/en-us/articles/33649966245783)
- [Beyond the basics: Using Figma Make](https://help.figma.com/hc/en-us/articles/35710574222487)
- [Push from Figma Make to GitHub](https://help.figma.com/hc/en-us/articles/35463818346647)

---

## Success Stories (Future)

Once we test the importer:
- [ ] Successfully imported Figma Make food delivery app
- [ ] Successfully imported Figma Make e-commerce site
- [ ] Successfully imported Figma Make task manager
- [ ] Demo video showing workflow
- [ ] Blog post: "From Figma Make to ShepLang in 5 minutes"

---

**Status:** Ready for testing! 🚀
