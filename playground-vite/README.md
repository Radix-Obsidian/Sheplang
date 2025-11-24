# ShepLang Lite - The Frontend Powerhouse

## Overview

A lightweight, browser-based IDE for ShepLang - the AI-native verified programming language. ShepLang Lite lets you build interactive web applications with zero backend setup, offering real-time compilation to React components and instant preview of your applications.

## Features

- **Real-time ShepLang syntax highlighting** via Monaco Editor
- **Instant previews** of ShepLang applications
- **Error detection** and diagnostics using real ShepLang compiler
- **Light/dark mode** theming
- **Split-pane layout** with resizable editor and preview panels
- **Mobile-friendly responsive design**
- **Real code generation preview** - See the React and TypeScript code that would be generated
- **Share capabilities** - Create shareable links to your ShepLang code

## Technology Stack

- **Vite** - Ultra-fast build tool and dev server
- **React** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Monaco Editor** - Professional code editor (same as VS Code)
- **ShepLang Compiler** - Real ShepLang language services

## Getting Started

### Development

```bash
# Start the development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── CodeEditor/   # Monaco editor integration
│   │   ├── Header/       # App header with controls
│   │   ├── Layout/       # Layout components (SplitPane)
│   │   └── Preview/      # Preview panel
│   ├── services/         # ShepLang services
│   │   ├── sheplangAnalyzer.ts    # Code analysis
│   │   └── sheplangPreview.ts     # Preview generation
│   ├── App.css          # Global styles
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── types.ts         # TypeScript definitions
└── index.html           # HTML template
```

## ShepLang Integration

This playground integrates with the real ShepLang compiler for authentic language features:

- **Parsing** - Uses `parseShep()` from `@goldensheepai/sheplang-language`
- **Preview** - Client-side HTML generation from ShepLang code
- **Syntax highlighting** - Custom Monaco language definition

## Next Steps

- Add examples gallery
- Add export functionality
- Add code generation preview
- Add real-time collaboration
- Add sharing capabilities

---

Developed by Golden Sheep AI
