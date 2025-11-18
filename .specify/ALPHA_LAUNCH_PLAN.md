# 🚀 ShepLang Alpha Launch Plan - Feb 2026

**Status:** Pre-Launch Preparation  
**Development Freeze Date:** November 17, 2025  
**Alpha Pilot Launch:** February 2026  
**Research-Backed:** Official VS Code + Product Hunt Documentation

---

## 📋 Executive Summary

ShepLang is ready for marketplace launch with:
- ✅ v2.0 Enterprise Features Complete (4/4 tests passing)
- ✅ Full verification engine (42/42 tests passing)
- ✅ Production-ready grammar and tooling
- ✅ Research-backed, zero-hallucination development

**Target Platforms:**
1. VS Code Marketplace (Primary)
2. Product Hunt (Launch Day)
3. NPM (Language Packages - Optional)
4. GitHub (Open Source Community)

---

## 🎯 Phase 1: Pre-Launch Preparation (Nov 2025 - Jan 2026)

### Week 1-2: Documentation Overhaul

#### 1.1 Root README.md
**Source:** [VS Code Extension Manifest Best Practices](https://code.visualstudio.com/api/references/extension-manifest)

**Must Include:**
- [ ] Hero image/GIF (< 1MB, showcasing key features)
- [ ] One-liner tagline: "The world's first AI-native programming language with 100% verified correctness"
- [ ] Badges (build status, version, downloads, rating)
- [ ] Quick Start (30 seconds to value)
- [ ] Feature highlights with screenshots
- [ ] Installation instructions
- [ ] Usage examples
- [ ] Contributing guidelines
- [ ] License information

**Benchmark:** [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot), [Cursor](https://marketplace.visualstudio.com/items?itemName=Cursor.cursor)

**Template:**
```markdown
<div align="center">
  <img src="./media/sheplang-hero.png" alt="ShepLang" width="600" />
  
  # ShepLang
  ### The AI-Native Programming Language with 100% Verified Correctness
  
  [![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/GoldenSheepAI.sheplang)](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang)
  [![Downloads](https://img.shields.io/vscode-marketplace/d/GoldenSheepAI.sheplang)](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang)
  [![Rating](https://img.shields.io/vscode-marketplace/r/GoldenSheepAI.sheplang)](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang)
  
  [Install](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang) • [Documentation](https://sheplang.dev/docs) • [Examples](./examples) • [Discord](https://discord.gg/sheplang)
</div>

## ✨ What is ShepLang?

ShepLang is the world's first **AI-native programming language** built from the ground up for AI code generation. Write natural, human-readable code that's **100% verified** before it ever runs.

**No runtime errors. No null pointers. No type mismatches. Ever.**

### 🎥 See It In Action

![ShepLang Demo](./media/demo.gif)

## 🚀 Quick Start

### Prerequisites
- VS Code 1.80.0 or higher
- Node.js 18+ (for local development)

### Installation
1. Open VS Code
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS)
3. Type: `ext install GoldenSheepAI.sheplang`
4. Press Enter

### Your First ShepLang App (30 seconds)
...
```

#### 1.2 Extension README (extension/README.md)
**Source:** [Publishing Extensions - VS Code](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

**Must Include:**
- [ ] Extension description (300 characters max for marketplace)
- [ ] Features list with screenshots
- [ ] Requirements
- [ ] Extension settings
- [ ] Known issues
- [ ] Release notes
- [ ] Following section

#### 1.3 Package READMEs
- [ ] `sheplang/packages/language/README.md`
- [ ] `sheplang/packages/verifier/README.md`
- [ ] `sheplang/packages/compiler/README.md`
- [ ] `shepyard/README.md`

### Week 3-4: Visual Assets

**Source:** [Extension Marketplace Presentation](https://code.visualstudio.com/api/references/extension-manifest#marketplace-presentation)

**Required Assets:**
- [ ] Icon (128x128 PNG, no SVG per VS Code rules)
- [ ] Hero image (1280x640, showcasing IDE integration)
- [ ] Feature screenshots (5-7 images, 1920x1080)
- [ ] Demo GIF (< 10MB, 30-60 seconds)
- [ ] Social media cards (1200x630 for Twitter/LinkedIn)
- [ ] Product Hunt thumbnail (1270x760)

**Tools:**
- Figma/Canva for static images
- Screen Studio / LICEcap for GIFs
- OBS Studio for screen recordings

### Week 5-6: Package Configuration

#### 2.1 Extension package.json
**Source:** [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)

```json
{
  "name": "sheplang",
  "displayName": "ShepLang - AI-Native Verified Programming",
  "description": "The world's first AI-native programming language with 100% verified correctness. No runtime errors, ever.",
  "version": "2.0.0",
  "publisher": "GoldenSheepAI",
  "icon": "media/icon.png",
  "galleryBanner": {
    "color": "#1e1e1e",
    "theme": "dark"
  },
  "categories": [
    "Programming Languages",
    "Linters",
    "Snippets"
  ],
  "keywords": [
    "sheplang",
    "ai-native",
    "verified",
    "type-safe",
    "language"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/goldensheepaI/sheplang"
  },
  "bugs": {
    "url": "https://github.com/goldensheepai/sheplang/issues"
  },
  "homepage": "https://sheplang.dev",
  "sponsor": {
    "url": "https://github.com/sponsors/goldensheepai"
  },
  "qna": "https://github.com/goldensheepai/sheplang/discussions"
}
```

#### 2.2 NPM Decision: **YES, Publish Language Packages**

**Reasoning:**
- TypeScript language packages are on NPM
- Developers need `@sheplang/language` for tooling integration
- ShepVerify as a standalone package has value
- Increases discoverability

**Packages to Publish:**
1. `@sheplang/language` - Core parser and grammar
2. `@sheplang/verifier` - Verification engine
3. `@sheplang/compiler` - Compiler toolchain
4. `@adapters/sheplang-to-boba` - Transpiler

**NPM Setup:**
```json
// package.json additions
{
  "keywords": [
    "programming-language",
    "langium",
    "parser",
    "verification",
    "ai-native"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### Week 7-8: Compliance & Legal

- [ ] **LICENSE:** MIT (already in place, verify all files)
- [ ] **CHANGELOG.md:** Semantic versioning from v0.1.0 to v2.0.0
- [ ] **CODE_OF_CONDUCT.md:** Contributor Covenant
- [ ] **SECURITY.md:** Vulnerability reporting process
- [ ] **Privacy Policy:** (if collecting telemetry - recommend opt-in only)
- [ ] **Terms of Service:** Clear usage terms

---

## 🎯 Phase 2: VS Code Marketplace Publishing (Jan 2026)

### Step-by-Step Publishing Process
**Source:** [Publishing Extensions - Official VS Code Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

#### 1. Create Azure DevOps Organization
- [ ] Sign up at https://dev.azure.com
- [ ] Create organization (name: `goldensheepai` or similar)
- [ ] Create Personal Access Token (PAT)
  - Scope: **Marketplace (Manage)**
  - Expiration: 90 days minimum
  - Store securely (password manager)

#### 2. Create Publisher
- [ ] Go to https://marketplace.visualstudio.com/manage
- [ ] Login with Microsoft account
- [ ] Create publisher
  - **ID:** `GoldenSheepAI` (cannot be changed later!)
  - **Name:** "Golden Sheep AI"
  - **Logo:** 200x200 PNG
  - **Description:** "Building AI-native programming languages and tools"

#### 3. Install vsce
```bash
npm install -g @vscode/vsce
```

#### 4. Package Extension
```bash
cd extension
vsce package
# Creates sheplang-2.0.0.vsix
```

#### 5. Publish Extension
```bash
# Login (one-time)
vsce login GoldenSheepAI

# Publish
vsce publish

# Or publish with version bump
vsce publish minor  # 2.0.0 -> 2.1.0
vsce publish patch  # 2.0.0 -> 2.0.1
```

#### 6. Verify Listing
- [ ] Check https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang
- [ ] Test installation in fresh VS Code
- [ ] Verify all images load
- [ ] Check README formatting

---

## 🎯 Phase 3: Product Hunt Launch (Feb 2026)

### Timeline: Launch Week Schedule
**Source:** [Awesome Product Hunt - Launch Strategies](https://github.com/fmerian/awesome-product-hunt)

**Best Launch Day:** Tuesday or Wednesday (highest traffic)  
**Best Time:** 12:01 AM PST (be first in queue)  
**Preparation:** 2 weeks before

### Pre-Launch (2 weeks before)

#### 1. Product Hunt Profile Setup
- [ ] Create Product Hunt account (use founder email)
- [ ] Complete profile (photo, bio, links)
- [ ] Join Product Hunt Ship (optional pre-launch page)
- [ ] Engage with community (upvote, comment on other products)

#### 2. Hunter Strategy
**Options:**
1. **Self-hunt** (recommended for developer tools)
2. **Find hunter** (someone with followers)

**Benchmark:** Most successful dev tools self-hunt (Warp, Raycast, Mintlify)

#### 3. Content Preparation

##### a) Product Hunt Listing
- [ ] **Name:** ShepLang
- [ ] **Tagline:** (60 chars) "AI-native programming with 100% verified correctness"
- [ ] **Description:** (260 chars)
  ```
  The world's first AI-native programming language built for AI code generation. 
  ShepLang catches 100% of bugs at compile-time with type safety, null safety, 
  endpoint validation, and exhaustiveness checking. No runtime errors, ever.
  ```
- [ ] **Thumbnail:** 1270x760 PNG (eye-catching, shows IDE)
- [ ] **Gallery:** 5-7 screenshots/GIFs
- [ ] **First Comment:** Detailed explanation (post immediately after launch)
- [ ] **Topics:** Developer Tools, Open Source, AI, Programming, VS Code
- [ ] **Makers:** Add team members
- [ ] **Links:**
  - Website
  - VS Code Marketplace
  - GitHub
  - Documentation
  - Discord/Community

##### b) First Comment Template
**Source:** [Successful launches from fmerian](https://github.com/fmerian/awesome-product-hunt)

```markdown
Hey Product Hunt! 👋

I'm AJ from Golden Sheep AI, and I'm excited to share ShepLang with you today!

## 🎯 What problem are we solving?

AI code generation is amazing, but AI-generated code has bugs. Runtime errors, null pointers, 
type mismatches - the things we've been fighting for decades. What if AI could generate code 
that's PROVEN correct before it runs?

## 💡 What is ShepLang?

ShepLang is the world's first AI-native programming language with 100% verified correctness.

**4 Verification Phases:**
1. ✅ Type Safety - No type mismatches
2. ✅ Null Safety - No null pointer errors  
3. ✅ Endpoint Validation - No broken API calls
4. ✅ Exhaustiveness - No missing cases

## 🚀 How it works

[GIF showing: Write code → Instant verification → No runtime errors]

## 📊 Why it matters

- AI writes code
- ShepLang proves it correct
- You ship without fear

## 🎁 What you get today

- VS Code extension (free, open source)
- Full language support (.shep files)
- Real-time verification
- Enterprise features (if/else, loops, expressions)
- 200+ line example apps

## 🙏 We'd love your feedback!

What bugs do you wish could be caught at compile-time?

GitHub: https://github.com/goldensheepai/sheplang
VS Code: [link]
Docs: [link]

Thanks for checking us out! 🐑✨
```

### Launch Day Checklist
**Source:** [Lessons from 42 launches - fmerian](https://dev.to/fmerian/lessons-from-42-launches-on-product-hunt-3fp8)

#### Morning (12:01 AM - 9:00 AM PST)
- [ ] 12:01 AM: Launch product
- [ ] 12:02 AM: Post first comment (detailed explanation)
- [ ] 12:05 AM: Share on Twitter with #ProductHunt
- [ ] 12:10 AM: Share in relevant communities (Reddit r/programming, Hacker News)
- [ ] 12:15 AM: Share on LinkedIn
- [ ] 1:00 AM: Check for comments, respond immediately
- [ ] 6:00 AM: Morning check-in, respond to all comments
- [ ] 8:00 AM: Post update if traction is good

#### Daytime (9:00 AM - 5:00 PM PST)
- [ ] Every 30 minutes: Check and respond to comments
- [ ] Every hour: Share progress update on Twitter
- [ ] Engage with people who upvote/comment
- [ ] Monitor competitor launches
- [ ] Post to Discord/Slack communities

#### Evening (5:00 PM - 11:59 PM PST)
- [ ] Final push: Share with personal network
- [ ] Respond to ALL comments
- [ ] Thank supporters publicly
- [ ] Screenshot rankings
- [ ] Prepare recap post

### Post-Launch (Next Day)
- [ ] Thank you post on Product Hunt
- [ ] Recap blog post
- [ ] Update website with "Featured on Product Hunt" badge
- [ ] Analyze metrics (upvotes, comments, clicks, installs)
- [ ] Follow up with commenters
- [ ] Plan improvements based on feedback

---

## 🎯 Phase 4: Community & Distribution

### Alternative Launch Platforms
**Source:** [Awesome Product Hunt - Alternatives](https://github.com/fmerian/awesome-product-hunt)

- [ ] **Hacker News (Show HN)** - https://news.ycombinator.com/showhn.html
  - Post same day as Product Hunt
  - Title: "Show HN: ShepLang - AI-native language with 100% verified correctness"
  
- [ ] **DevHunt** - https://devhunt.org/
  - Developer-focused Product Hunt alternative
  - Launch same week
  
- [ ] **Uneed** - https://www.uneed.best/
  - Submit tool listing
  
- [ ] **early.tools** - https://www.early.tools/submit
  - Early-stage developer tools directory

### Community Building

#### GitHub
- [ ] Pin README to profile
- [ ] Create GitHub Discussions
- [ ] Add CONTRIBUTING.md
- [ ] Set up issue templates
- [ ] Create project board
- [ ] Add GitHub Actions badges

#### Social Media
- [ ] **Twitter/X:** Daily tips, updates, examples
- [ ] **LinkedIn:** Professional updates, technical articles
- [ ] **Dev.to:** Technical blog posts
- [ ] **YouTube:** Tutorial videos, demos
- [ ] **Discord:** Community server (optional for alpha)

#### Developer Outreach
- [ ] Submit to "Awesome" lists (awesome-vscode, awesome-langium)
- [ ] Post on r/programming, r/vscode, r/ProgrammingLanguages
- [ ] Reach out to tech YouTubers
- [ ] Write guest posts for dev blogs
- [ ] Present at local meetups/conferences

---

## 📊 Success Metrics

### VS Code Marketplace
- **Week 1:** 100 installs
- **Month 1:** 500 installs
- **Month 3:** 2,000 installs
- **Rating:** 4.5+ stars
- **Reviews:** 10+ positive reviews

### Product Hunt
- **Goal:** Top 5 Product of the Day
- **Stretch:** Top 3 Product of the Day
- **Dream:** #1 Product of the Day
- **Upvotes:** 300+
- **Comments:** 50+

### NPM (Language Packages)
- **Month 1:** 1,000 downloads
- **Month 3:** 5,000 downloads
- **Dependents:** 5+ packages using @sheplang/*

### GitHub
- **Stars:** 500+ in first month
- **Forks:** 50+
- **Contributors:** 10+
- **Issues/Discussions:** Active engagement

---

## ✅ Pre-Launch Checklist (Final Review)

### Documentation
- [ ] Root README.md (with hero, badges, quick start)
- [ ] Extension README.md (marketplace-ready)
- [ ] All package READMEs updated
- [ ] CHANGELOG.md (v0.1.0 → v2.0.0)
- [ ] LICENSE verified in all files
- [ ] CODE_OF_CONDUCT.md
- [ ] CONTRIBUTING.md
- [ ] SECURITY.md

### Visual Assets
- [ ] Extension icon (128x128 PNG)
- [ ] Hero image (1280x640)
- [ ] Feature screenshots (5-7 images)
- [ ] Demo GIF (< 10MB)
- [ ] Social cards (1200x630)
- [ ] Product Hunt thumbnail (1270x760)

### Package Configuration
- [ ] extension/package.json (complete manifest)
- [ ] All package.json files (keywords, repo links)
- [ ] .vscodeignore (optimized bundle size)
- [ ] NPM publishConfig set to public

### Testing
- [ ] All 46 tests passing (42 verifier + 4 v2.0)
- [ ] Extension works in fresh VS Code install
- [ ] All examples run successfully
- [ ] No console errors
- [ ] Performance profiling complete

### Accounts & Setup
- [ ] Azure DevOps organization created
- [ ] Personal Access Token generated
- [ ] VS Code publisher created
- [ ] NPM account ready
- [ ] Product Hunt profile complete
- [ ] Twitter/LinkedIn ready for launch

### Legal & Compliance
- [ ] MIT license in all packages
- [ ] No proprietary dependencies
- [ ] All images have proper licensing
- [ ] Privacy policy (if needed)
- [ ] No SVG security violations

---

## 🎯 Launch Day Schedule (Example: Tuesday, Feb 4, 2026)

**All times PST**

- **11:30 PM (Mon):** Final checks, coffee ready
- **12:00 AM:** Launch on Product Hunt
- **12:01 AM:** Post first comment
- **12:02 AM:** Tweet with #ProductHunt
- **12:05 AM:** Post to Hacker News (Show HN)
- **12:10 AM:** Share on LinkedIn
- **12:15 AM:** Post in Discord/Slack communities
- **12:30 AM:** Initial response sweep
- **1:00-6:00 AM:** Monitor, respond, sleep in shifts
- **6:00 AM:** Morning update, respond to all
- **9:00 AM-6:00 PM:** Active engagement
- **6:00 PM:** Final push
- **11:59 PM:** Screenshot final ranking

---

## 📚 References

### Official Documentation
1. [VS Code Publishing Extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
2. [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
3. [Product Hunt Launch Guide](https://www.producthunt.com/launch)
4. [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

### Benchmark Examples
1. [GitHub Copilot on Marketplace](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
2. [Warp on Product Hunt](https://www.producthunt.com/products/warp/launches/warp)
3. [Raycast on Product Hunt](https://www.producthunt.com/products/raycast/launches/raycast-api-and-store)
4. [Mintlify on Product Hunt](https://www.producthunt.com/products/mintlify/launches/mintlify)
5. [Awesome Product Hunt](https://github.com/fmerian/awesome-product-hunt)

---

**Status: READY TO EXECUTE** 🚀

*All development frozen until Feb 2026 Alpha Pilot.*
*Focus: Documentation, Assets, Community Building.*
