# 🐑 ShepLang & ShepVerify Branding Kit

**For Landing Page Design - November 2025**

---

## Brand Identity

### Brand Name
- **Primary:** ShepLang
- **Product:** ShepVerify
- **Company:** Golden Sheep AI

### Tagline Options
1. "Ship Verified Code. Any Language."
2. "The Lighthouse for Your Codebase"
3. "AI Writes Code. ShepVerify Proves It."
4. "Real-Time Verification for VS Code"

### Brand Personality
- **Friendly** - Approachable, not intimidating
- **Trustworthy** - Verification = confidence
- **Playful** - Sheep theme, fun animations
- **Technical** - For real developers

---

## Mascot & Icons

### Primary Mascot: The Golden Sheep 🐑
Use sheep imagery throughout - friendly, golden, helpful.

### Emoji Usage (like Charm.land's ❤️)
| Emoji | Meaning | Use Case |
|-------|---------|----------|
| 🐑 | ShepLang/Brand | Headers, CTAs |
| 🛡️ | ShepVerify | Verification sections |
| ✓ | Passed | Green checkmarks |
| ⚠️ | Warning | Yellow warnings |
| ✖ | Error | Red errors |
| ⭐ | Feature highlight | Benefits |
| 🚀 | Launch/Install | CTAs |
| 💛 | Golden Sheep love | Testimonials, community |

### Animated Sheep Concept (like Charm's heart)
- Floating sheep icon in hero section
- Sheep "bounces" or "floats" gently
- Could have sparkles (✨) around it
- CSS animation: `float` or `bounce`

```css
@keyframes sheep-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.sheep-mascot {
  animation: sheep-float 3s ease-in-out infinite;
}
```

---

## Color Palette

### Primary Colors
| Name | Hex | Use |
|------|-----|-----|
| **Golden Yellow** | `#FFD700` | Accents, sheep, highlights |
| **Verification Green** | `#4EC9B0` | Passed, success, scores |
| **Warning Yellow** | `#DCDCAA` | Warnings |
| **Error Red** | `#F14C4C` | Errors, failed |

### Background Colors
| Name | Hex | Use |
|------|-----|-----|
| **Deep Purple** | `#1a1a2e` | Dark mode background |
| **Soft Purple** | `#6B5B95` | Gradients |
| **Midnight Blue** | `#16213e` | Cards, sections |
| **Pure Black** | `#0f0f0f` | Code blocks |

### Gradient (Hero Section)
```css
/* Inspired by Charm.land's purple gradient */
background: linear-gradient(135deg, 
  #667eea 0%, 
  #764ba2 50%, 
  #6B5B95 100%
);
```

### Alternative Golden Gradient
```css
/* Golden Sheep theme */
background: linear-gradient(135deg, 
  #1a1a2e 0%, 
  #2d2d44 50%, 
  #FFD700 200% /* subtle gold glow */
);
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### Headings
- **Hero:** 48-64px, Bold
- **Section:** 32-40px, Semi-bold
- **Subsection:** 24px, Medium

### Code Font
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
```

---

## Key Sections for Landing Page

### 1. Hero Section
```
🐑 ShepLang

Ship Verified Code.
Any Language.

Real-time verification for TypeScript, Python, React, 
and 8 more languages. Catch bugs before they ship.

[🚀 Install for VS Code]  [Try Playground]

✓ 11 Languages  ✓ Real-Time  ✓ Click-to-Fix
```

### 2. Problem/Solution
```
AI Writes Code.
But Who Verifies It? 🛡️

❌ Traditional: Write → Run → Error → Fix → Repeat
✓ ShepVerify: Write → Verified Instantly → Ship
```

### 3. Languages Supported (with icons)
```
🔷 TypeScript    🟡 JavaScript    ⚛️ React
🐍 Python        🌐 HTML          🎨 CSS
📦 JSON          🐑 ShepLang      ...and more
```

### 4. How It Works
```
1️⃣ Install Extension
2️⃣ Open Any File  
3️⃣ See Verification Score
4️⃣ Click Errors → Jump to Line
5️⃣ Ship with Confidence 🚀
```

### 5. Score Display (Visual)
```
┌─────────────────────────────┐
│  🛡️ ShepVerify              │
│  ───────────────────────    │
│  Score: 94% ████████░░      │
│                             │
│  ✓ Type Safety      100%    │
│  ✓ Null Safety       85%    │
│  ✓ API Contracts    100%    │
│  ✓ Exhaustiveness    90%    │
└─────────────────────────────┘
```

### 6. CTA Section
```
🐑 Ready to Ship Verified Code?

[🚀 Install for VS Code - Free]

Works with: VS Code • Cursor • Windsurf
```

---

## Animation Ideas (like Charm.land)

### Floating Sheep
```css
.hero-sheep {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(2deg); }
  75% { transform: translateY(-4px) rotate(-2deg); }
}
```

### Sparkle Effect
```css
.sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}
```

### Score Bar Animation
```css
.score-fill {
  animation: fill-in 1s ease-out forwards;
}

@keyframes fill-in {
  from { width: 0%; }
  to { width: var(--score); }
}
```

---

## Social Proof Elements

### Stats to Highlight
- 🛡️ **11 Languages** supported
- ⚡ **Real-time** verification
- 🎯 **4 Phases** of checks
- 📍 **Click-to-navigate** errors

### Testimonial Style
```
"Finally, I can see code quality before my PR review." 💛

— TypeScript Developer
```

---

## Assets Needed

### Images
1. **Hero illustration** - Golden sheep with code/verification theme
2. **Screenshot** - VS Code extension showing dashboard
3. **Language icons** - For supported languages section

### Existing Assets
- `/public/sheplang-icon.png` - Logo
- `/public/sheplang-icon.svg` - Vector logo

---

## Brand Voice

### Do's ✓
- Be friendly and approachable
- Use sheep/shepherd metaphors
- Focus on confidence and trust
- Show real value (verification scores)

### Don'ts ✖
- Don't be overly technical
- Don't explain HOW verification works (that's our moat)
- Don't promise features we don't have
- Don't compete with AI coding tools (we complement them)

---

## Quick Reference

```
Primary Color:    #FFD700 (Golden Yellow)
Success Color:    #4EC9B0 (Verification Green)
Warning Color:    #DCDCAA
Error Color:      #F14C4C
Background:       #1a1a2e (Deep Purple)

Mascot:           🐑 Golden Sheep
Product Icon:     🛡️ Shield (ShepVerify)
Success:          ✓ Checkmark
CTA:              🚀 Rocket

Font:             System UI / JetBrains Mono (code)
Style:            Playful but Professional
Tone:             Friendly, Confident, Technical
```

---

## Inspiration

- **Charm.land** - Playful animations, mascot focus
- **Linear.app** - Clean, technical, professional
- **Vercel.com** - Gradient backgrounds, developer focus
- **Supabase** - Friendly tone, green accents

---

*"Making programming human again." 🐑*

**Golden Sheep AI - 2025**
