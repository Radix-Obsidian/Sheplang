# ShepLang Agent Orchestration System

Complete agent-based workflow system for ShepLang development. Provides deterministic, phase-based orchestration with Windsurf IDE integration.

## 🎯 System Overview

The agent system consists of three layers:

1. **Agent Definitions** (`/agents/`) - YAML specs defining agent capabilities
2. **Orchestration Scripts** (`/scripts/`) - Node.js execution engine
3. **Windsurf Workflows** (`/.windsurf/workflows/`) - Interactive IDE integration

## 📦 Complete File Structure

```
ShepLang/
├── agents/                          # Agent definitions (7 files)
│   ├── transpiler-engineer.yaml     # AST → TypeScript codegen
│   ├── dx-optimizer.yaml            # Developer experience
│   ├── build-engineer.yaml          # Build system optimization
│   ├── cli-developer.yaml           # CLI implementation
│   ├── integration-tester.yaml      # End-to-end testing
│   ├── orchestrator.yaml            # Phase routing logic
│   └── orchestrator-routes.yaml     # Task routing rules
│
├── scripts/                         # Orchestration engine (3 files)
│   ├── run-agent.mjs                # Single agent executor (9.2 KB)
│   ├── orchestrate.mjs              # Multi-agent coordinator (14.3 KB)
│   └── README.md                    # Script documentation (7.8 KB)
│
├── .windsurf/                       # Windsurf IDE integration
│   ├── workflows/                   # Workflow definitions (9 files)
│   │   ├── transpiler-engineer.yaml
│   │   ├── dx-optimizer.yaml
│   │   ├── build-engineer.yaml
│   │   ├── cli-developer.yaml
│   │   ├── integration-tester.yaml
│   │   ├── phase-2.5-orchestration.yaml
│   │   ├── phase-3-orchestration.yaml
│   │   ├── quick-test.yaml
│   │   └── README.md                # Workflow documentation
│   └── README.md                    # Integration overview
│
├── windsurf/commands/               # Slash commands
│   └── agents-commands.yaml         # /agents command registry
│
└── AGENT-SYSTEM.md                  # This file
```

**Total:** 22 files (7 agents + 3 scripts + 9 workflows + 3 docs)

## 🚀 Usage Methods

### Method 1: Windsurf Command Palette

Press `Ctrl+Shift+P` → "Run Workflow" → Select workflow

**Available workflows:**
- Transpiler Engineer Agent
- DX Optimizer Agent
- Build Engineer Agent
- CLI Developer Agent
- Integration Tester Agent
- Phase 2.5 - DX Completion & Integration
- Phase 3 - Polish & Production Readiness
- Quick Test - Agent System

### Method 2: Slash Commands (Windsurf Chat)

```bash
# Interactive workflow with prompts
/agents workflow transpiler-engineer

# Phase orchestration
/agents workflow phase-2.5-orchestration

# Direct agent execution
/agents run transpiler-engineer on finalize-transpiler

# With phase routing
/agents run orchestrator on coordinate phase=2.5

# Help
/agents help
```

### Method 3: Terminal Commands

```bash
# Single agent task
node scripts/run-agent.mjs <agent-name> <task-id>

# Examples:
node scripts/run-agent.mjs transpiler-engineer finalize-transpiler
node scripts/run-agent.mjs build-engineer workspace-build

# Phase orchestration
node scripts/orchestrate.mjs orchestrator coordinate <phase>

# Examples:
node scripts/orchestrate.mjs orchestrator coordinate 2.5
node scripts/orchestrate.mjs orchestrator coordinate 3
```

## 🤖 Available Agents

### 1. Transpiler Engineer
**Phase:** 1, 2.5  
**Focus:** AST → TypeScript code generation

**Tasks:**
- `finalize-transpiler` - Complete AppModel → TS templates
- `snapshots` - Create & update snapshot tests
- `verify-determinism` - Verify build determinism

**Success Criteria:**
- Transpile todo.shep → .shep/out/App/entry.ts
- Snapshot tests pass deterministically
- No writes outside allowed paths

### 2. DX Optimizer
**Phase:** 2, 2.5, 3  
**Focus:** Developer experience & tooling

**Tasks:**
- `optimize-dev-loop` - HMR < 100ms, rebuild < 1s
- `implement-stats` - Build metrics to .shep/reports/dx.json
- `format-lint` - Wire sheplang format + lint

**Success Criteria:**
- HMR < 100ms observed
- stats JSON contains timings
- CLI help lists all commands

### 3. Build Engineer
**Phase:** 2.5, 3  
**Focus:** TypeScript-only build system

**Tasks:**
- `enforce-ts-only` - Remove .js sources
- `workspace-build` - Wire tsc project references
- `perf-improve` - Incremental + caching

**Success Criteria:**
- pnpm -w -r build < 30s
- No .js in repo (excluding dist/)
- All packages emit ESM

### 4. CLI Developer
**Phase:** 2, 2.5, 3  
**Focus:** CLI implementation & hardening

**Tasks:**
- `implement-commands` - parse/build/dev/explain/format/stats
- `cli-ux` - Help, flags, error messages
- `ci-wire` - CI workflow setup

**Success Criteria:**
- Commands work on clean checkout
- CI coverage ≥ 90%
- Help text complete

### 5. Integration Tester
**Phase:** 2.5, 3  
**Focus:** End-to-end testing

**Tasks:**
- `e2e-pipeline` - Full CLI + runtime tests
- `negative-cases` - Error handling tests
- `snapshots-docs` - Snapshot .ts and .md

**Success Criteria:**
- vitest --run passes all suites
- Coverage ≥ 95%
- Runtime serves at http://localhost:8787

## 📋 Phase Orchestrations

### Phase 2.5: DX Completion & Integration
**Duration:** 15-30 minutes  
**Agents:** 5 (sequential)  
**Abort-on-fail:** Enabled

**Sequence:**
1. **Build Engineer** → `workspace-build` (TS-only + workspaces)
2. **Transpiler Engineer** → `finalize-transpiler` (AppModel → TS)
3. **DX Optimizer** → `optimize-dev-loop` (HMR + rebuild speed)
4. **CLI Developer** → `implement-commands` (CLI features)
5. **Integration Tester** → `e2e-pipeline` (E2E coverage)

**Run:**
```bash
/agents workflow phase-2.5-orchestration
# or
node scripts/orchestrate.mjs orchestrator coordinate 2.5
```

### Phase 3: Polish & Production Readiness
**Duration:** 10-20 minutes  
**Agents:** 3 (sequential)  
**Abort-on-fail:** Enabled

**Sequence:**
1. **Integration Tester** → `e2e-pipeline` (Final test pass)
2. **CLI Developer** → `cli-ux` (Polish UX)
3. **Build Engineer** → `perf-improve` (Optimize builds)

**Run:**
```bash
/agents workflow phase-3-orchestration
# or
node scripts/orchestrate.mjs orchestrator coordinate 3
```

## 🛠️ Technical Features

### Zero Dependencies
- Pure Node.js built-ins (fs, path, child_process)
- No external npm packages required
- Custom YAML parser implementation

### Deterministic Execution
- Sequential step execution
- Abort-on-fail for critical paths
- Reproducible builds with hash verification

### Comprehensive Logging
- File: `.shep/logs/orchestrator.log`
- Console: Color-coded output (green/red/cyan/yellow)
- Format: `[timestamp] LEVEL message | details`

### TypeScript-Aware
- Respects .ts sources
- No compiled artifacts required
- Works with ts-node and direct execution

### Production-Ready
- Error handling with stack traces
- Exit codes: 0 (success), 1 (error), 2 (pending)
- File existence validation
- Command mapping with fallbacks

## 📊 Execution Flow

```
┌─────────────────────────────────────────────┐
│  User Trigger                               │
│  • Windsurf Command Palette                 │
│  • Slash Command (/agents)                  │
│  • Terminal (node scripts/...)              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Workflow Layer (.windsurf/workflows/)      │
│  • Parse workflow YAML                      │
│  • Display prompts if interactive           │
│  • Execute steps sequentially               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Orchestration Layer (scripts/*.mjs)        │
│  • run-agent.mjs: Single task execution     │
│  • orchestrate.mjs: Multi-agent routing     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Agent Layer (agents/*.yaml)                │
│  • Parse agent definition                   │
│  • Load task details                        │
│  • Check permissions                        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Execution Layer                            │
│  • Map task to actual command               │
│  • Execute with spawn()                     │
│  • Capture output                           │
│  • Return exit code                         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Logging Layer (.shep/logs/)                │
│  • Write to orchestrator.log                │
│  • Console output with colors               │
│  • Success/error summary                    │
└─────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Quick Diagnostics

Run the system health check:
```bash
/agents workflow quick-test
```

### Common Issues

**Workflow not appearing in Windsurf:**
```bash
# Check YAML syntax
node --check .windsurf/workflows/<name>.yaml
# Restart Windsurf IDE
```

**Script execution fails:**
```bash
# Verify Node.js version (needs 20+)
node --version

# Check script syntax
node --check scripts/run-agent.mjs
node --check scripts/orchestrate.mjs

# Make executable (Unix)
chmod +x scripts/*.mjs
```

**Agent task fails:**
```bash
# Check logs
cat .shep/logs/orchestrator.log

# Verify pnpm
pnpm --version

# Test individual command
node scripts/run-agent.mjs <agent> <task>
```

### Log Analysis

Logs are stored in `.shep/logs/orchestrator.log`:
```
[2025-11-10T15:04:32.123Z] INFO Starting phase orchestration: 2.5
[2025-11-10T15:04:32.456Z] AGENT Executing: build-engineer
[2025-11-10T15:05:01.789Z] SUCCESS Agent completed successfully
```

**Log levels:**
- `INFO` - General information
- `SUCCESS` - Task completed successfully
- `ERROR` - Task failed
- `WARN` - Non-critical warning
- `PHASE` - Phase orchestration event
- `AGENT` - Agent execution event

## 📚 Documentation Index

### Core Documentation
- **This file** - System overview and quick reference
- `/scripts/README.md` - Orchestration script details
- `/.windsurf/workflows/README.md` - Workflow documentation
- `/.windsurf/README.md` - IDE integration guide

### Agent Definitions
- `/agents/transpiler-engineer.yaml` - Transpiler agent spec
- `/agents/dx-optimizer.yaml` - DX optimizer agent spec
- `/agents/build-engineer.yaml` - Build engineer agent spec
- `/agents/cli-developer.yaml` - CLI developer agent spec
- `/agents/integration-tester.yaml` - Integration tester agent spec
- `/agents/orchestrator.yaml` - Phase routing rules
- `/agents/orchestrator-routes.yaml` - Task routing rules

### Workflow Definitions
- `/.windsurf/workflows/transpiler-engineer.yaml`
- `/.windsurf/workflows/dx-optimizer.yaml`
- `/.windsurf/workflows/build-engineer.yaml`
- `/.windsurf/workflows/cli-developer.yaml`
- `/.windsurf/workflows/integration-tester.yaml`
- `/.windsurf/workflows/phase-2.5-orchestration.yaml`
- `/.windsurf/workflows/phase-3-orchestration.yaml`
- `/.windsurf/workflows/quick-test.yaml`

## 🎓 Best Practices

1. **Start with quick-test** - Validate system before production runs
2. **Use workflows for common tasks** - Save time with pre-configured sequences
3. **Check logs on failure** - Detailed diagnostics in `.shep/logs/`
4. **Run phases in order** - Phase 2.5 before Phase 3
5. **One workflow at a time** - Avoid concurrent agent execution
6. **Monitor abort-on-fail** - Phase orchestrations stop on first error
7. **Review success criteria** - Each agent has defined outcomes
8. **Keep definitions in sync** - Agent YAMLs, workflows, and scripts

## 🔐 Security & Permissions

### File System Permissions

Each agent defines allowed paths:

**Write permissions** (example from build-engineer):
- `packages/**`
- `tsconfig*.json`
- `pnpm-workspace.yaml`

**Read permissions** (example from build-engineer):
- `**/*` (all files)

Scripts enforce these permissions through path validation.

### Safe Execution

- Scripts use `spawn()` with explicit args (no shell injection)
- Exit codes validated before proceeding
- Abort-on-fail prevents cascade failures
- All commands logged for audit trail

## 📈 Metrics & Reporting

### Build Metrics
DX optimizer emits metrics to `.shep/reports/dx.json`:
```json
{
  "hmr_time_ms": 95,
  "rebuild_time_ms": 850,
  "file_count": 142,
  "timestamp": "2025-11-10T15:04:32.123Z"
}
```

### Orchestration Logs
All runs logged with:
- Start/end timestamps
- Agent/task execution details
- Success/failure status
- Command outputs
- Error stack traces

## 🚢 Deployment Readiness

### Prerequisites
- ✅ Node.js 20+
- ✅ pnpm (latest)
- ✅ Git (for workspace)
- ✅ Unix or Windows with PowerShell

### Validation
```bash
# System health
/agents workflow quick-test

# Individual agents
node scripts/run-agent.mjs build-engineer workspace-build

# Phase 2.5 (full validation)
node scripts/orchestrate.mjs orchestrator coordinate 2.5
```

### CI/CD Integration
Add to `.github/workflows/agents.yml`:
```yaml
name: Agent Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node scripts/orchestrate.mjs orchestrator coordinate 2.5
```

## 📄 License

Part of the ShepLang project. See root LICENSE for details.

---

**Version:** 1.0  
**Status:** Production-ready  
**Created:** 2025-11-10  
**Components:** 7 agents, 3 scripts, 9 workflows, 4 docs
