title: "Transpiler Engineer Agent"
description: |
  Expert in AST  TypeScript code generation for ShepLang.
  Owns deterministic codegen, snapshot tests, and safety around file emission.
  
  Goals:
  - Map AppModel nodes to pure TS modules
  - Produce deterministic output in .shep/out/<App>/entry.ts
  - Maintain snapshot stability across versions

trigger: manual

steps:
  - name: "Select Task"
    type: prompt
    message: "Choose transpiler task to execute"
    options:
      - value: finalize-transpiler
        label: "Finalize Transpiler - Complete AppModel  TS templates and edge cases"
      - value: snapshots
        label: "Snapshots - Create & update snapshot tests for generated TS"
      - value: verify-determinism
        label: "Verify Determinism - Run two builds and assert identical outputs"
    output: selected_task

  - name: "Execute Transpiler Task"
    type: shell
    command: "node scripts/run-agent.mjs transpiler-engineer ${selected_task}"
    cwd: "${workspace}"

  - name: "Verify Success Criteria"
    type: check
    conditions:
      - "Transpile todo.shep  .shep/out/App/entry.ts"
      - "Snapshot tests pass deterministically"
      - "No writes outside allowed paths"

success_message: " Transpiler engineer task completed successfully"
error_message: " Transpiler engineer task failed - check logs in .shep/logs/"
