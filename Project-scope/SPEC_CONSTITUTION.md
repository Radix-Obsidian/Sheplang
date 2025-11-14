# Spec Constitution — Sheplang / BobaScript / Shepyard

## Purpose

This document defines the rules that all AI agents (Windsurf, Cursor, etc.) must follow when working in this repository.

---

## Non-Negotiable Rules

1. **Locked Packages**
   - The following are locked and must not be changed unless a spec explicitly says so:
     - `sheplang/packages/language`
     - `sheplang/packages/runtime`
     - `sheplang/packages/compiler`
     - `sheplang/packages/transpiler`
     - `sheplang/packages/cli`
     - `adapters/sheplang-to-boba`

2. **Scope by Spec**
   - All work must be scoped by:
     - A PRD (what & why)
     - A TTD (technical tasks definition)
     - The SDD (this constitution + system spec).
   - If a file or folder is not listed in the current TTD's "Allowed files" section, it must not be created or modified.

3. **No Placeholder-Only Code**
   - No empty functions or components just to satisfy types.
   - No "TODO: implement later" unless explicitly allowed in the current phase.
   - If something is wired in the UI, it must be backed by real logic or a clearly documented mock that returns realistic data.

4. **Tests Before Exit**
   - Every phase requires:
     - At least one automated test.
     - Manual test instructions.
   - `pnpm run verify` must be green before we consider the phase complete.

5. **Local-First**
   - CDS Alpha must run entirely offline.
   - No new cloud dependencies are allowed in Phase 0.

---

## Spec-Driven Workflow (Spec Kit Style)

We mirror Spec Kit's `/specify`, `/plan`, `/tasks` commands as:

- `/specify` → PRD documents (e.g. `PRD_Shepyard_CDS_Alpha.md`)
- `/plan`    → TTD & SDD (e.g. `TTD_Shepyard_Phase_0.md`, `SDD_Shepyard_CDS_Alpha.md`)
- `/tasks`   → Phase task lists inside TTD files.

AI agents must:
- Read all relevant PRD, TTD, SDD docs.
- Confirm in their own words what they are about to build.
- Only then edit code.

This mirrors Spec-Kit's pattern of specifications → plans → tasks, but in a manual, repo-native way instead of a Python CLI.
