# Slice 7 Spec – Docs & Telemetry

**Date:** November 24, 2025  
**Status:** ✅ Complete  
**Goal:** Update documentation with importer capabilities + add optional telemetry

---

## Goals

### Primary
1. **Update ALPHA_CAPABILITIES.md** – Document the new AST importer features (Slices 0-6)
2. **Add telemetry service** – Track import success/failure with feature flag
3. **Privacy-first design** – Telemetry is opt-in, anonymous, and minimal

### Acceptance Criteria
- ALPHA_CAPABILITIES.md includes AST importer section
- Telemetry service with enable/disable setting
- Import events tracked: start, success, failure, duration
- No PII collected, only aggregate metrics
- Documentation updated

---

## Implementation Plan

### 1. Documentation Updates

**Files to update:**
- `playground-vite/docs/ALPHA_CAPABILITIES.md` – Add importer section
- `docs/SLICE_0_3_STATUS.md` – Already complete (Slice 0-6)

**New section: "7. AST Importer"**
- Supported frameworks (Next.js, Vite, React)
- Supported features (Prisma, API routes, components)
- Wizard flow description
- Output formats (ShepLang + ShepThon)

### 2. Telemetry Service

**File:** `extension/src/services/telemetry.ts`

```typescript
interface ImportTelemetryEvent {
  event: 'import_start' | 'import_success' | 'import_failure';
  framework?: string;
  entityCount?: number;
  viewCount?: number;
  actionCount?: number;
  routeCount?: number;
  durationMs?: number;
  errorType?: string;
}
```

**Privacy principles:**
- ✅ Opt-in via VS Code setting
- ✅ No file paths, project names, or code content
- ✅ Only aggregate counts and timings
- ✅ Anonymous session ID (no user identification)
- ✅ Data sent to internal analytics only

### 3. Feature Flag

**VS Code Setting:** `sheplang.telemetry.enabled`
- Default: `false` (opt-in)
- Respects VS Code's global telemetry setting

---

## Telemetry Events

| Event | Data | Purpose |
|-------|------|---------|
| `import_start` | framework, timestamp | Track import attempts |
| `import_success` | counts, duration | Measure success rate |
| `import_failure` | errorType, duration | Identify common failures |

---

## Files

```
extension/src/
└── services/
    └── telemetry.ts         # NEW: Telemetry service

playground-vite/docs/
└── ALPHA_CAPABILITIES.md    # UPDATED: Add importer section
```

---

## Success Metrics

1. ✅ Documentation reflects all Slice 0-6 features
2. ✅ Telemetry service created with feature flag
3. ✅ Privacy-first design (opt-in, anonymous)
4. ✅ No test regressions

---

*Built following Golden Sheep AI Methodology™ – Vertical Slice Delivery*
