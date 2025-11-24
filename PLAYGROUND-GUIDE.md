# ShepLang Playground Guide

## Available Playgrounds

ShepLang provides two playground options for exploring and testing the language:

### 1. Vite Playground (Recommended)

A lightweight, browser-based IDE for ShepLang with a clean interface and reliable performance.

**Best for:**
- Exploring ShepLang syntax
- Testing simple applications
- Viewing real-time previews
- Fast iteration

**Features:**
- Real-time syntax highlighting
- Instant previews
- Error diagnostics
- Light/dark theme

**How to Start:**
```bash
# Using the script
./start-playground.cmd

# OR using npm script
pnpm dev:playground-vite
```

Then open: http://localhost:5173/

### 2. Next.js Playground (Advanced)

A more complex playground with server-side integration capabilities but less stable.

**Best for:**
- Advanced server-side testing
- Integration with backend APIs
- Full-stack experimentation

**Features:**
- Server-side rendering
- API route integration
- Export functionality
- Code generation viewer

**How to Start:**
```bash
pnpm dev:playground
```

Then open: http://localhost:3000/

## Choosing the Right Playground

- **Just trying ShepLang?** → Use Vite Playground
- **Need server-side features?** → Use Next.js Playground
- **Having issues with Next.js?** → Use Vite Playground
- **Want to see real code output?** → Use VS Code extension

## VS Code Extension

For the full ShepLang experience, we recommend using the VS Code extension, which provides:

- Full-stack code generation
- Backend API integration
- Database connectivity
- Production deployment features

Install it from the VS Code Marketplace: [ShepLang VS Code Extension](https://marketplace.visualstudio.com/items?itemName=goldensheep-ai.sheplang)
