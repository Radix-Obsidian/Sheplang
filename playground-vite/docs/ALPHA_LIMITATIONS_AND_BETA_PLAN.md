# Alpha Limitations & Beta Resolution Plan

This document is the contract with our early users. It spells out exactly what ShepLang + the VS Code extension cannot do during alpha, why, and how we plan to unblock those gaps in beta.

---

## 1. Platform-Level Constraints

| Area | Current Limitation (Alpha) | Impact | Beta Resolution |
|------|----------------------------|--------|-----------------|
| Authentication | Basic email/password only, no magic links or SSO | Founder apps must wire their own auth flows post-compilation | Ship passwordless + role guards as code snippets + ShepThon handlers. Provide documented pattern for Auth0/Supabase via `call` templates. |
| Real-time Updates | No native websocket/subscription support | Dashboards require manual refresh (`load` triggered by user) | Add `load interval` helper + ShepThon websocket bridge. Provide recipe for optimistic UI + webhook triggers. |
| File Uploads | Requires custom backend endpoint; playground mock only | Any attachment-heavy app needs manual wiring | Provide verified storage connectors (Supabase/S3) + UI snippet with drag/drop. |
| Notifications | No first-party email/SMS helpers | Founders must hand-write `call POST` to Sendgrid/Twilio endpoints | Bundle `notify email`/`notify sms` helpers that compile down to `call` statements tied to verified services. |
| Deployment Targets | Web (React/TypeScript) only | Native mobile + multi-target compile not available | Beta adds experimental React Native + Python backend emitters, tracked in ROADMAP.md. |
| Collaboration | Single-player editor experience | Teams must share files manually | Post-beta: add shareable playground sessions + VS Code Live Share starter workspace. |

---

## 2. Language / Syntax Gaps

- **No `loop` or `map` constructs** yet – encourage deterministic `action` blocks; roadmap for composable collections is active.
- **Enums & unions** are hand-coded via literal validation; typed enums scheduled for beta.
- **Limited styling control** – generated frontend uses ShepUI defaults. Customize via compiled output until theming DSL lands.
- **No embedded JS/TS** allowed (by design). Use `call` hooks into backend for anything imperative.

---

## 3. VS Code Extension Limitations

| Feature | Status | Beta Plan |
|---------|--------|-----------|
| Auto-migrate compiled code | ❌ Not yet | Provide `sheplang sync` command to re-emit frontend without overwriting manual edits via patching. |
| Multi-file ShepLang projects | ⚠️ Manual | CLI can compile multiple `.shep` files but VS Code tree view still basic. Beta adds project workspace view + cross-file references. |
| In-IDE docs | ⚠️ Limited | Hover text only. Beta adds command palette "ShepLang Docs" linking to the new docs folder and inline quick help. |
| Test runner integration | ❌ | Beta surfaces `pnpm sheplang verify` inside VS Code terminal with rich diagnostics. |

---

## 4. Playground Limitations

- **Frontend only**: No backend execution; API calls are mocked.
- **No persistence** beyond browser storage.
- **No analytics/telemetry** shipped (privacy-first) – we rely on user reports.

_Beta goal_: Add optional backend preview via edge functions + example data.

---

## 5. Beta Milestones (Living Document)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M1 – Connectors Pack | Verified `call/load` manifests for Stripe, Airtable, Notion, Slack + docs | December 2025 |
| M2 – Auth & Files Kit | Snippets + backend handlers for passwordless auth, role guards, file uploads | January 2026 |
| M3 – Collaboration & Sharing | Playground share sessions, VS Code project view, `sheplang sync` command | February 2026 |
| M4 – Multi-target Output | Beta React Native + Python emitters with limited scope | March 2026 |

Dates will adjust based on user feedback; every release will update this doc so founders always know what’s real.

---

## 6. How to Report Missing Capabilities

1. Confirm whether the capability is already listed above.
2. If not, open a GitHub issue with labels `docs` + `limitation` and link to your ShepLang snippet.
3. We’ll either document the limitation here or provide a workaround within 48 hours.

Transparency is the moat. Keep this doc brutally honest.
