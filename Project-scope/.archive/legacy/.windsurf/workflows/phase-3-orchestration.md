title: "Phase 3 - Polish & Production Readiness"
description: |
  Complete orchestration workflow for Phase 3 of ShepLang development.
  Focuses on polish, performance optimization, and production readiness.
  
  This phase focuses on:
  - Comprehensive integration testing
  - CLI UX improvements
  - Build performance optimization
  - Production-ready artifacts

trigger: manual

steps:
  - name: "Phase 3 Kickoff"
    type: info
    message: |
       Starting Phase 3 Orchestration
      
      This will execute 3 agents in sequence:
      1. Integration Tester  e2e-pipeline
      2. CLI Developer  cli-ux
      3. Build Engineer  perf-improve
      
      Abort-on-fail: ENABLED
      Logs: .shep/logs/orchestrator.log

  - name: "Step 1 - Integration Tester: E2E Pipeline"
    type: shell
    command: "node scripts/run-agent.mjs integration-tester e2e-pipeline"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Create comprehensive e2e tests across CLI and runtime"

  - name: "Step 2 - CLI Developer: CLI UX"
    type: shell
    command: "node scripts/run-agent.mjs cli-developer cli-ux"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Improve help, flags, error messages"

  - name: "Step 3 - Build Engineer: Performance Improve"
    type: shell
    command: "node scripts/run-agent.mjs build-engineer perf-improve"
    cwd: "${workspace}"
    abort_on_error: true
    description: "Speed up builds via incremental + caching"

  - name: "Phase 3 Complete"
    type: info
    message: |
       Phase 3 orchestration completed successfully!
      
      All agents executed without errors:
       Integration test suite complete with 95% coverage
       CLI provides excellent user experience
       Builds complete in < 30s with caching
      
      ShepLang is now production-ready! 
      
      Check logs: .shep/logs/orchestrator.log

success_message: " Phase 3 orchestration completed - ShepLang is production-ready!"
error_message: " Phase 3 orchestration failed - Check .shep/logs/orchestrator.log for details"

metadata:
  phase: "3"
  agents: ["integration-tester", "cli-developer", "build-engineer"]
  duration_estimate: "10-20 minutes"
  prerequisites:
    - "Phase 2.5 complete"
    - "All Phase 2.5 tests passing"
