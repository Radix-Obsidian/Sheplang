title: "Phase 2.5 - DX Completion & Integration"
description: |
  Complete orchestration workflow for Phase 2.5 of ShepLang development.
  Executes all agents in sequence with deterministic routing and abort-on-fail.
  
  This phase focuses on:
  - TypeScript-only build system
  - Transpiler finalization
  - Developer experience optimization
  - CLI command implementation
  - End-to-end integration testing

trigger: manual

steps:
  - name: "Phase 2.5 Kickoff"
    type: info
    message: |
       Starting Phase 2.5 Orchestration
      
      This will execute 5 agents in sequence:
      1. Build Engineer  workspace-build
      2. Transpiler Engineer  finalize-transpiler
      3. DX Optimizer  optimize-dev-loop
      4. CLI Developer  implement-commands
      5. Integration Tester  e2e-pipeline
      
      Abort-on-fail: ENABLED
      Logs: .shep/logs/orchestrator.log

  - name: "Step 1 - Build Engineer: Workspace Build"
    type: shell
    command: "node scripts/run-agent.mjs build-engineer workspace-build"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Wire tsc project references and pnpm workspaces"

  - name: "Step 2 - Transpiler Engineer: Finalize Transpiler"
    type: shell
    command: "node scripts/run-agent.mjs transpiler-engineer finalize-transpiler"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Complete AppModel  TS templates and edge cases"

  - name: "Step 3 - DX Optimizer: Optimize Dev Loop"
    type: shell
    command: "node scripts/run-agent.mjs dx-optimizer optimize-dev-loop"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Improve dev rebuilds + live preview reload"

  - name: "Step 4 - CLI Developer: Implement Commands"
    type: shell
    command: "node scripts/run-agent.mjs cli-developer implement-commands"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Finalize parse/build/dev/explain/format/stats"

  - name: "Step 5 - Integration Tester: E2E Pipeline"
    type: shell
    command: "node scripts/run-agent.mjs integration-tester e2e-pipeline"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Create e2e tests across CLI and runtime"

  - name: "Phase 2.5 Complete"
    type: info
    message: |
       Phase 2.5 orchestration completed successfully!
      
      All agents executed without errors:
       Build system is TypeScript-only with workspace support
       Transpiler generates deterministic TypeScript output
       Developer experience optimized (HMR < 100ms)
       CLI commands fully implemented
       E2E test coverage  95%
      
      Check logs: .shep/logs/orchestrator.log

success_message: " Phase 2.5 orchestration completed successfully - All 5 agents passed"
error_message: " Phase 2.5 orchestration failed - Check .shep/logs/orchestrator.log for details"

metadata:
  phase: "2.5"
  agents: ["build-engineer", "transpiler-engineer", "dx-optimizer", "cli-developer", "integration-tester"]
  duration_estimate: "15-30 minutes"
  prerequisites:
    - "Phase 0 parser complete"
    - "pnpm installed"
    - "Node.js 20+"
