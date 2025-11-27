# ShepVerify Scoring Methodology Plan

**Date:** November 27, 2025  
**Status:** PLANNED - Research Required  
**Priority:** HIGH - Differentiator Feature  
**Target:** Beta v1.0

---

## The Problem

Current scoring is **hardcoded placeholders** (e.g., 100% when no issues found). This violates Golden Sheep methodology:
- **Zero-Placeholder Policy (ZPP)** - "No fake data. No TODOs."
- **Full-Stack Reality Testing (FSRT)** - "Test everything the way users will experience it."

We need **real, research-backed scoring** inspired by industry standards.

---

## Industry Research Required

### 1. Code Quality Scoring Standards

| Tool | Scoring Model | What They Measure |
|------|---------------|-------------------|
| **SonarQube** | A-E grades + Technical Debt | Bugs, Vulnerabilities, Code Smells, Coverage, Duplications |
| **ESLint** | Error/Warning counts | Style, Best Practices, Possible Errors |
| **Pylint** | 0-10 scale | Convention, Refactor, Warning, Error, Fatal |
| **Google Lighthouse** | 0-100 per category | Performance, Accessibility, Best Practices, SEO |
| **CodeClimate** | A-F grades + Maintainability | Complexity, Duplication, Churn |

### 2. Metrics We Should Research

**SonarQube's Quality Gate Model:**
```
Quality Gate = PASSED if:
  - Coverage >= 80%
  - Duplications <= 3%
  - Maintainability Rating >= A
  - Reliability Rating >= A
  - Security Rating >= A
```

**Pylint's Scoring Formula:**
```
Score = 10 - ((float(5 * error + warning + refactor + convention) / statement) * 10)
```

**Lighthouse's Weighted Scoring:**
```
Performance Score = weighted_average(
  FCP * 0.10,
  SI * 0.10,
  LCP * 0.25,
  TTI * 0.10,
  TBT * 0.30,
  CLS * 0.15
)
```

---

## Proposed ShepVerify Scoring Model

### Phase 1: Per-Language Metrics (Alpha)

Each language gets domain-specific metrics that make sense:

#### TypeScript/JavaScript
| Metric | Weight | How to Calculate |
|--------|--------|------------------|
| **Type Safety** | 30% | `100 - (any_count * 5) - (assertion_count * 3)` |
| **Null Safety** | 25% | `100 - (potential_null_access * 10) - (non_null_assertions * 5)` |
| **Code Quality** | 25% | `100 - (missing_switch_default * 10) - (deep_nesting * 5)` |
| **React Patterns** | 20% | `100 - (untyped_props * 10) - (missing_deps * 5)` |

#### Python
| Metric | Weight | How to Calculate |
|--------|--------|------------------|
| **Type Hints** | 30% | `(typed_functions / total_functions) * 100` |
| **None Safety** | 25% | `100 - (potential_none_access * 10)` |
| **Code Quality** | 25% | Complexity, naming conventions |
| **Best Practices** | 20% | PEP8 compliance, docstrings |

#### HTML
| Metric | Weight | How to Calculate |
|--------|--------|------------------|
| **Accessibility** | 40% | `100 - (missing_alt * 15) - (empty_buttons * 10)` |
| **SEO** | 30% | `100 - (missing_title * 20) - (missing_meta * 10)` |
| **Semantics** | 30% | `(semantic_elements / total_elements) * 100` |

#### CSS
| Metric | Weight | How to Calculate |
|--------|--------|------------------|
| **Best Practices** | 40% | `100 - (important_count * 10)` |
| **Performance** | 35% | `100 - (universal_selectors * 5) - (deep_nesting * 3)` |
| **Maintainability** | 25% | Selector complexity, DRY violations |

#### JSON
| Metric | Weight | How to Calculate |
|--------|--------|------------------|
| **Syntax** | 50% | Pass/Fail (binary) |
| **Schema Compliance** | 30% | Match against expected schema |
| **Best Practices** | 20% | Required fields present |

### Phase 2: Weighted Overall Score (Beta)

```typescript
function calculateOverallScore(metrics: LanguageMetrics): number {
  const weights = getWeightsForLanguage(language);
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const [metric, score] of Object.entries(metrics)) {
    const weight = weights[metric] || 0;
    if (score !== undefined) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
```

### Phase 3: Severity-Based Scoring (v1.0)

Inspired by SonarQube and Pylint:

```typescript
interface IssueSeverity {
  blocker: number;  // -25 points each
  critical: number; // -15 points each
  major: number;    // -10 points each
  minor: number;    // -5 points each
  info: number;     // -1 point each
}

function calculateScore(issues: Issue[], lineCount: number): number {
  const penalties = issues.reduce((sum, issue) => {
    return sum + severityPenalty[issue.severity];
  }, 0);
  
  // Normalize by file size (larger files allowed more issues)
  const normalizedPenalty = (penalties / Math.sqrt(lineCount)) * 10;
  
  return Math.max(0, Math.round(100 - normalizedPenalty));
}
```

---

## Implementation Roadmap

### Alpha MVP (Now)
- [x] Basic per-language metrics
- [x] Simple scoring (100 - issues * penalty)
- [ ] Python adapter (URGENT)
- [ ] Wire all adapters properly

### Beta (Q1 2025)
- [ ] Research SonarQube scoring methodology
- [ ] Implement weighted scoring
- [ ] Add severity levels to issues
- [ ] Normalize by file size
- [ ] Add historical trend tracking

### v1.0 (Q2 2025)
- [ ] Machine learning calibration (what scores correlate with actual bugs?)
- [ ] Industry benchmark comparisons
- [ ] Customizable weights per project
- [ ] Team-specific quality gates

---

## Research Tasks

### Official Documentation to Study
1. **SonarQube Metrics**: https://docs.sonarqube.org/latest/user-guide/metric-definitions/
2. **Pylint Scoring**: https://pylint.readthedocs.io/en/latest/user_guide/output.html
3. **ESLint Rules**: https://eslint.org/docs/rules/
4. **Lighthouse Scoring**: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/
5. **CodeClimate**: https://docs.codeclimate.com/docs/maintainability

### Questions to Answer
1. How does SonarQube calculate "Technical Debt"?
2. What's the mathematical model behind Pylint's 0-10 score?
3. How does Lighthouse weight different metrics?
4. What severity levels does ESLint use?
5. How do other tools handle file size normalization?

---

## Golden Sheep Alignment

### VSD (Vertical Slice Delivery)
Each language adapter is a vertical slice - complete from check to score.

### ZPP (Zero-Placeholder Policy)
Scores must be calculated, not hardcoded. Every metric must measure something real.

### EDD (Evidence-Driven Debugging)
Scoring methodology must be based on official documentation, not invented.

### ACV (AI Companion Verification)
Scores should be explainable - users should understand WHY they got that score.

---

## Success Criteria

1. **No 100% scores for messy code** - If there are issues, score should reflect it
2. **Language-appropriate metrics** - Python shows Python metrics, not TypeScript
3. **Explainable scores** - "You got 75% because of 3 type errors and 2 null issues"
4. **Research-backed** - Every formula has a source (SonarQube, Pylint, etc.)
5. **Comparable** - 80% in TypeScript should mean similar quality as 80% in Python

---

## Files to Update

1. `extension/src/services/universalVerifier.ts` - Add Python adapter, update scoring
2. `extension/src/dashboard/types.ts` - Add severity levels
3. `extension/src/dashboard/treeViewProvider.ts` - Show score breakdown
4. `.specify/MULTI_LANGUAGE_SHEPVERIFY_PLAN.md` - Update with Python status

---

*"Don't build wide. Build deep. Every metric must be real." - Golden Sheep Methodology*
