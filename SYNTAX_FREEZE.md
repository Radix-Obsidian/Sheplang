# ShepLang Syntax Freeze — Edition 2025

**Edition:** 2025  
**Phase:** 2.5 → 3 (Alpha Hardening)  
**Owner:** Spec Agent  
**Freeze Date:** 2025-11-11

---

## 🔒 Locked Grammar

- Core syntax based on Langium parser as of commit `HEAD@2025-11-11`
- Any new keywords, operators, or structural grammar must go through an RFC
- Current locked elements:
  - `app` declaration
  - `data` blocks with `fields:` and `rules:`
  - `view` blocks with `list` and `button` directives
  - `action` blocks with parameters and operations
  - Field types: `text`, `yes/no`, number literals
  - String literals (quoted rules)
  - Field assignment syntax with optional `=`

---

## ✅ Allowed Changes

- **Diagnostics and Explain output** may evolve if semantics unchanged
- **Transpiler optimizations** that do not alter emitted BobaScript structure
- **Error messages** can be improved for better DX
- **CLI flags and options** can be added (non-breaking)
- **Documentation generation** format improvements
- **Performance optimizations** in parser/transpiler

---

## 🚫 Forbidden Changes

- **Breaking syntax changes** to existing `.shep` files
- **Removal of keywords** or operators
- **Changes to field type semantics** without RFC
- **AST structure modifications** that break transpiler
- **Grammar changes** that invalidate existing examples

---

## 📋 Deprecation Policy

- No breaking removals inside this Edition
- All deprecations introduced via lints and marked `@deprecated`
- Deprecation warnings must include:
  - Clear explanation of what's deprecated
  - Recommended alternative
  - Timeline for removal (next Edition)
- Next eligible Edition window: **2026 Q4**

---

## 🧪 Verification

- `scripts/verify.ps1` must complete successfully on Windows PowerShell 7+
- All builds run under strict TypeScript 5.3+ with project references
- Example apps in `examples/` must transpile and run without modification
- Test suite must maintain ≥90% coverage (Phase 2.5) → ≥95% (Phase 3)

---

## 📝 RFC Process (for future grammar changes)

1. **Proposal:** Document syntax change with examples
2. **Impact Analysis:** Assess breaking changes and migration path
3. **Community Review:** Minimum 2-week review period
4. **Implementation:** Only after approval and Edition boundary
5. **Migration Guide:** Provide automated migration tools when possible

---

## 🎯 Edition Goals

This freeze ensures:
- **Stability** for early adopters and ShepKit integration
- **Predictable behavior** across all tooling
- **Deterministic transpilation** with snapshot testing
- **Zero syntax drift** during alpha phase
- **Clear upgrade path** for future editions

---

## 📌 Commitment

> "We never go outside of our scope for any reasons, no matter what. If we can't get something to work, we solve the problem within scope—we don't make an easier alternative or workaround."

This Edition freeze is our contract with users: **what works today will work tomorrow**.
