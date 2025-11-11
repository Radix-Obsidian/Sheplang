# ShepLang Orchestration Scripts

Production-ready orchestration system for coordinating multi-agent workflows in ShepLang development.

## 📁 Files

- **`run-agent.mjs`** - Execute individual agent tasks
- **`orchestrate.mjs`** - Coordinate multi-agent workflows with phase-based routing
- **`README.md`** - This documentation

## 🚀 Quick Start

### Run a Single Agent Task

```bash
node scripts/run-agent.mjs <agent-name> <task-id>
```

**Example:**
```bash
node scripts/run-agent.mjs transpiler-engineer finalize-transpiler
```

### Run Phase Orchestration

```bash
node scripts/orchestrate.mjs orchestrator coordinate <phase>
```

**Example:**
```bash
# Execute all agents for Phase 2.5
node scripts/orchestrate.mjs orchestrator coordinate 2.5
```

### Task-Based Routing

```bash
node scripts/orchestrate.mjs orchestrator <task-name>
```

**Example:**
```bash
node scripts/orchestrate.mjs orchestrator "finalize transpiler"
```

## 📋 Available Agents

### transpiler-engineer
**Phase:** 1, 2.5  
**Tasks:**
- `finalize-transpiler` - Complete AppModel → TS templates and edge cases
- `snapshots` - Create & update snapshot tests for generated TS
- `verify-determinism` - Run two builds and assert identical outputs

### dx-optimizer
**Phase:** 2, 2.5, 3  
**Tasks:**
- `optimize-dev-loop` - Improve dev rebuilds + live preview reload
- `implement-stats` - Record build/reload metrics to .shep/reports/dx.json
- `format-lint` - Wire sheplang format + lint integration end-to-end

### build-engineer
**Phase:** 2.5, 3  
**Tasks:**
- `enforce-ts-only` - Remove stray .js sources; ensure ESM outputs in dist
- `workspace-build` - Wire tsc project references and pnpm workspaces
- `perf-improve` - Speed up builds via incremental + caching

### cli-developer
**Phase:** 2, 2.5, 3  
**Tasks:**
- `implement-commands` - Finalize parse/build/dev/explain/format/stats
- `cli-ux` - Improve help, flags, error messages
- `ci-wire` - Add CI workflow to run lint + tests

### integration-tester
**Phase:** 2.5, 3  
**Tasks:**
- `e2e-pipeline` - Create e2e tests across CLI and runtime
- `negative-cases` - Invalid syntax, missing fields, missing views
- `snapshots-docs` - Snapshot .ts and .md outputs for stability

## 🎯 Phase Workflows

### Phase 2.5 Sequence
Executes agents in this order:
1. **build-engineer** → `workspace-build`
2. **transpiler-engineer** → `finalize-transpiler`
3. **dx-optimizer** → `optimize-dev-loop`
4. **cli-developer** → `implement-commands`
5. **integration-tester** → `e2e-pipeline`

### Phase 3 Sequence
Executes agents in this order:
1. **integration-tester** → `e2e-pipeline`
2. **cli-developer** → `cli-ux`
3. **build-engineer** → `perf-improve`

## 🔧 Features

### `run-agent.mjs`
- ✅ Parses agent YAML definitions without external dependencies
- ✅ Color-coded console output (success/error/info/warning)
- ✅ Displays agent goals, permissions, and success criteria
- ✅ Maps tasks to actual pnpm/node commands
- ✅ Exit codes: 0 (success), 1 (error), 2 (pending implementation)

### `orchestrate.mjs`
- ✅ Phase-based routing from orchestrator.yaml
- ✅ Task-based routing from orchestrator-routes.yaml
- ✅ Sequential execution with abort-on-fail
- ✅ Comprehensive logging to `.shep/logs/orchestrator.log`
- ✅ Summary report with step-by-step results
- ✅ Color-coded progress indicators

## 📝 Logging

All orchestration runs are logged to:
```
.shep/logs/orchestrator.log
```

Log format:
```
[2025-11-10T15:04:32.123Z] INFO Starting phase orchestration: 2.5
[2025-11-10T15:04:32.456Z] AGENT Executing: build-engineer | Task: workspace-build
[2025-11-10T15:05:01.789Z] SUCCESS Agent build-engineer completed successfully
```

## 🛡️ Error Handling

- **Abort-on-fail:** When enabled (default), orchestration stops at first failure
- **Exit codes:**
  - `0` - All tasks completed successfully
  - `1` - One or more tasks failed
  - `2` - Task pending implementation (warning, not error)

## 🔗 Integration with Windsurf

The orchestration scripts are designed to work with the Windsurf slash-commands:

```bash
# In Windsurf IDE
/agents run transpiler-engineer on finalize-transpiler
/agents run orchestrator on coordinate phase=2.5
/agents help
```

These commands are defined in `/windsurf/commands/agents-commands.yaml` and call these scripts under the hood.

## 📦 Dependencies

**Zero external dependencies!** 

Both scripts use only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path manipulation
- `child_process` - Subprocess execution
- `url` - URL utilities

## 🏗️ Extending the System

### Adding a New Agent

1. Create `agents/<agent-name>.yaml` with the standard format
2. Add task mappings in `run-agent.mjs` (line ~175):
   ```javascript
   const taskCommands = {
     'your-task-id': ['pnpm', ['your', 'command', 'args']],
   };
   ```

### Adding a New Route

Edit `agents/orchestrator-routes.yaml`:
```yaml
routes:
  - match:
      task: "your task description"
    send:
      agent: target-agent
      task: target-task-id
```

### Modifying Phase Sequences

Edit `agents/orchestrator.yaml` under `routing_rules`.

## 🐛 Troubleshooting

### "No command mapping for task"
Some tasks are marked as pending implementation. Add the command mapping in `run-agent.mjs` or implement the supporting script.

### "No routing rule found for phase"
Check that the phase number matches exactly in `orchestrator.yaml`. Format: `phase=X.Y`

### Script syntax errors
Verify with:
```bash
node --check scripts/run-agent.mjs
node --check scripts/orchestrate.mjs
```

## 📊 Example Output

```
╔═══════════════════════════════════════════════════════════════╗
║              ShepLang Orchestrator v1.0                       ║
╚═══════════════════════════════════════════════════════════════╝

[2025-11-10T15:04:32.123Z] PHASE Starting phase orchestration: 2.5
[2025-11-10T15:04:32.456Z] INFO Executing 5 agent(s) in sequence | abort_on_fail: true

═══════════════════════════════════════════════════════════════
Step 1/5: build-engineer → workspace-build
═══════════════════════════════════════════════════════════════

[2025-11-10T15:04:32.789Z] AGENT Executing: build-engineer | Task: workspace-build
...
✓ Task completed successfully

═══════════════════════════════════════════════════════════════
ORCHESTRATION SUMMARY (Phase 2.5)
═══════════════════════════════════════════════════════════════

1. ✓ SUCCESS build-engineer → workspace-build
2. ✓ SUCCESS transpiler-engineer → finalize-transpiler
3. ✓ SUCCESS dx-optimizer → optimize-dev-loop
4. ✓ SUCCESS cli-developer → implement-commands
5. ✓ SUCCESS integration-tester → e2e-pipeline

Results: 5 successful, 0 failed
═══════════════════════════════════════════════════════════════
```

## 📄 License

Part of the ShepLang project. See root LICENSE for details.
