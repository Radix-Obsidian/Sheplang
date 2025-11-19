# Root Folder Cleanup Summary

**Date:** November 19, 2025  
**Status:** ✅ Organized and cleaned

---

## Changes Made

### ✅ Moved to `docs/deployment/`
- `DOCKER.md` → `docs/deployment/DOCKER.md`
- `DEPLOY.md` → `docs/deployment/DEPLOY.md`
- `DUAL_PUBLISHING.md` → `docs/deployment/DUAL_PUBLISHING.md`
- `PUBLISHING_FIX.md` → `docs/deployment/PUBLISHING_FIX.md`
- `PUBLISH_EXTENSION.md` → `docs/deployment/PUBLISH_EXTENSION.md`
- `INSTALL_FROM_GITHUB.md` → `docs/deployment/INSTALL_FROM_GITHUB.md`

### ✅ Moved to `.specify/`
- `FIGMA_BRIDGE_SUMMARY.md` → `.specify/FIGMA_BRIDGE_SUMMARY.md`
- `GITHUB_UPDATE_COMPLETE.md` → `.specify/GITHUB_UPDATE_COMPLETE.md`
- `GITHUB_REPO_STATUS.md` → `.specify/GITHUB_REPO_STATUS.md`

---

## Docker Files - Recommended Action

### Can Be Removed (Not Actively Used):
- ❌ `Dockerfile` - Not used in current workflow
- ❌ `docker-compose.yml` - Not used in current workflow
- ❌ `.dockerignore` - Not used in current workflow

**Reason:** You're not deploying with Docker. These are template files that aren't referenced anywhere in the codebase.

**Action:** Move to `.archive/docker/` for future reference:
```bash
mkdir -p .archive/docker
mv Dockerfile docker-compose.yml .dockerignore .archive/docker/
```

---

## Keep These Files (Required)

### ✅ `.npmrc` - REQUIRED
- Needed for pnpm workspace
- Configures peer dependency handling
- Used by Vercel deployment

### ✅ Core Documentation (Keep at Root)
- `README.md` - Main project readme
- `README-NPM.md` - NPM package readme
- `CHANGELOG.md` - Version history
- `ROADMAP.md` - Product roadmap
- `CODE_OF_CONDUCT.md` - Community guidelines
- `CONTRIBUTING.md` - Contribution guide
- `SECURITY.md` - Security policy
- `AIVP_MANIFESTO.md` - Vision document

### ✅ Configuration Files (Keep at Root)
- `package.json` - Root package config
- `pnpm-workspace.yaml` - Monorepo config
- `pnpm-lock.yaml` - Dependency lock
- `.gitignore` - Git ignore rules
- `.gitattributes` - Git attributes

---

## Current Root Structure (After Cleanup)

```
Sheplang/
├── .archive/              # Archived code
├── .github/               # GitHub workflows
├── .specify/              # Project specs (now includes status docs)
├── .windsurf/             # Windsurf config
├── adapters/              # Adapter packages
├── docs/                  # All documentation
│   ├── deployment/        # Deployment docs (moved here)
│   └── spec/              # Spec docs
├── extension/             # VS Code extension
├── scripts/               # Build scripts
├── sheplang/              # Core language packages
├── README.md              # Main readme
├── CHANGELOG.md           # Version history
├── ROADMAP.md             # Product roadmap
├── package.json           # Root config
├── pnpm-workspace.yaml    # Monorepo config
└── .npmrc                 # NPM config (KEEP)
```

---

## Recommended Next Steps

### 1. Archive Docker Files (Optional)
```bash
New-Item -ItemType Directory -Path ".archive\docker" -Force
Move-Item -Path "Dockerfile", "docker-compose.yml", ".dockerignore" -Destination ".archive\docker\" -Force
```

### 2. Update README Links
If README.md references moved files, update paths:
- Old: `[Docker Setup](DOCKER.md)`
- New: `[Docker Setup](docs/deployment/DOCKER.md)`

---

## Files Analysis

### Docker Files (Not Used):
- **Dockerfile** - Defines Docker image (not used)
- **docker-compose.yml** - Docker orchestration (not used)
- **.dockerignore** - Docker build exclusions (not used)

**Verdict:** Archive or delete - not part of current workflow

### .npmrc (Required):
```
# Required for Vercel monorepo deployment
# Prevents peer dependency conflicts in workspace packages
strict-peer-dependencies=false
auto-install-peers=true
```

**Verdict:** Keep - needed for pnpm workspace

---

## Benefits of Cleanup

✅ **Cleaner Root** - Fewer files to navigate  
✅ **Better Organization** - Related docs grouped  
✅ **Clear Purpose** - Each folder has a role  
✅ **Easier Onboarding** - New contributors find things faster  
✅ **Professional** - Shows attention to project structure  

---

## Status

- ✅ Deployment docs organized
- ✅ Status docs moved to .specify
- ⏳ Docker files (awaiting your decision)
- ✅ .npmrc confirmed as required

**Root is now cleaner and more organized!** 🎉
