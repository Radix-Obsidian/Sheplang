# Windsurf Integration for ShepLang

This directory contains Windsurf IDE integration files for the ShepLang agent orchestration system.

## 📁 Structure

```
.windsurf/
├── workflows/          # Executable workflow definitions
│   ├── README.md                      # Workflow documentation
│   ├── transpiler-engineer.yaml       # Transpiler tasks
│   ├── dx-optimizer.yaml              # DX optimization tasks
│   ├── build-engineer.yaml            # Build system tasks
│   ├── cli-developer.yaml             # CLI development tasks
│   ├── integration-tester.yaml        # Integration testing tasks
│   ├── phase-2.5-orchestration.yaml   # Phase 2.5 full sequence
│   ├── phase-3-orchestration.yaml     # Phase 3 full sequence
│   └── quick-test.yaml                # System health check
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Run a Workflow from Windsurf

Press `Ctrl+Shift+P` and search "Run Workflow":
- Select any workflow from the list
- Follow interactive prompts
- Monitor progress in terminal

### 2. Use Slash Commands in Chat

```bash
# Trigger a workflow
/agents workflow phase-2.5-orchestration

# Direct agent execution
/agents run transpiler-engineer on finalize-transpiler

# Show available commands
/agents help
```

### 3. Run from Terminal

```bash
# Individual task
node scripts/run-agent.mjs <agent-name> <task-id>

# Phase orchestration
node scripts/orchestrate.mjs orchestrator coordinate <phase>
```

## 🎯 Available Workflows

### Individual Agents (Interactive)
- **transpiler-engineer** - Code generation & transpiler work
- **dx-optimizer** - Developer experience improvements
- **build-engineer** - Build system optimization
- **cli-developer** - CLI feature development
- **integration-tester** - End-to-end testing

### Phase Orchestrations (Automated)
- **phase-2.5-orchestration** - Complete Phase 2.5 (5 agents, 15-30 min)
- **phase-3-orchestration** - Complete Phase 3 (3 agents, 10-20 min)

### Utilities
- **quick-test** - Verify agent system health

## 🔧 Configuration

### Slash Commands
Defined in `/windsurf/commands/agents-commands.yaml`:
- `/agents run` - Direct agent execution
- `/agents workflow` - Trigger a workflow
- `/agents help` - Show help

### Workflows
Each workflow in `/workflows/` defines:
- **title** - Human-readable name
- **description** - What it does
- **steps** - Sequence of actions
- **success_criteria** - Expected outcomes

## 📊 Workflow Execution Model

```
Windsurf UI
    ↓
Workflow YAML (.windsurf/workflows/)
    ↓
Orchestration Scripts (scripts/*.mjs)
    ↓
Agent Definitions (agents/*.yaml)
    ↓
Actual Commands (pnpm, node, etc.)
    ↓
Logs (.shep/logs/orchestrator.log)
```

## 🛡️ Features

### Deterministic Execution
- Sequential step execution
- Abort-on-fail for critical paths
- Comprehensive logging

### Interactive Workflows
- Prompt-based task selection
- Real-time progress updates
- Color-coded terminal output

### Zero Dependencies
- Pure Node.js scripts
- No external npm packages
- Works out of the box

## 📝 Logging

All workflow runs are logged to:
```
.shep/logs/orchestrator.log
```

Log format includes:
- Timestamp
- Log level (INFO, SUCCESS, ERROR, WARN)
- Agent/task details
- Command outputs

## 🐛 Troubleshooting

### Workflow doesn't appear
1. Check YAML syntax: `node -e "require('yaml').parse(fs.readFileSync('.windsurf/workflows/your-workflow.yaml','utf8'))"`
2. Restart Windsurf IDE
3. Verify file is in `.windsurf/workflows/`

### Command fails
1. Check logs: `cat .shep/logs/orchestrator.log`
2. Run quick-test: `/agents workflow quick-test`
3. Verify Node.js version: `node --version` (needs 20+)
4. Verify pnpm: `pnpm --version`

### Permission errors
Unix systems:
```bash
chmod +x scripts/*.mjs
```

Windows (PowerShell):
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 🔗 Related Documentation

- **Workflows:** `/workflows/README.md` - Detailed workflow documentation
- **Scripts:** `/scripts/README.md` - Orchestration script documentation
- **Agents:** `/agents/*.yaml` - Agent definitions and capabilities
- **Project:** `/Project-scope/PRD` - Product requirements

## 📚 Examples

### Example 1: Run Phase 2.5
```bash
/agents workflow phase-2.5-orchestration
```
This executes all 5 agents in sequence with abort-on-fail.

### Example 2: Single Agent Task
```bash
/agents workflow transpiler-engineer
# Select "finalize-transpiler" from prompt
```

### Example 3: Direct Execution
```bash
/agents run build-engineer on workspace-build
```

### Example 4: Test System
```bash
/agents workflow quick-test
```

## 🎓 Best Practices

1. **Start with quick-test** - Verify system health before production runs
2. **Use workflows for common tasks** - Save time with pre-configured sequences
3. **Check logs on failure** - Detailed diagnostics in `.shep/logs/`
4. **Run phases in order** - 2.5 before 3
5. **One workflow at a time** - Avoid concurrent execution conflicts

## 📈 Workflow Development

### Creating a New Workflow

1. Create YAML in `.windsurf/workflows/`:
```yaml
title: "My Workflow"
description: "What it does"
trigger: manual
steps:
  - name: "Step 1"
    type: shell
    command: "your-command"
```

2. Test it:
```bash
/agents workflow my-workflow
```

3. Document it in `/workflows/README.md`

### Modifying Existing Workflows

1. Edit the YAML file directly
2. Changes take effect immediately
3. Test with a dry run if possible

## 🏗️ Architecture

The Windsurf integration bridges IDE workflows to the agent orchestration system:

**Layer 1: UI**
- Windsurf Command Palette
- Slash commands in chat
- Terminal commands

**Layer 2: Workflows**
- YAML definitions in `.windsurf/workflows/`
- Interactive prompts and steps
- Success/error messages

**Layer 3: Orchestration**
- `scripts/run-agent.mjs` - Single agent tasks
- `scripts/orchestrate.mjs` - Multi-agent coordination

**Layer 4: Agents**
- YAML definitions in `agents/`
- Task descriptions and requirements
- Success criteria

**Layer 5: Execution**
- Real pnpm/node commands
- File system operations
- Test execution

## 📄 License

Part of the ShepLang project. See root LICENSE for details.

---

**Version:** 1.0  
**Status:** Production-ready  
**Last Updated:** 2025-11-10
