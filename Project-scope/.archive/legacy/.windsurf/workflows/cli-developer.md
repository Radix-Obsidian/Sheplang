title: "CLI Developer Agent"
description: |
  Implements and hardens ShepLang CLI (sheplang).
  Commands: parse, build, dev, explain, format, stats.
  
  Goals:
  - Commands are idempotent and exit with correct codes
  - Human-friendly diagnostics and colored output
  - Compatible across Node 20/22

trigger: manual

steps:
  - name: "Select CLI Task"
    type: prompt
    message: "Choose CLI development task"
    options:
      - value: implement-commands
        label: "Implement Commands - Finalize parse/build/dev/explain/format/stats"
      - value: cli-ux
        label: "CLI UX - Improve help, flags, error messages"
      - value: ci-wire
        label: "CI Wire - Add CI workflow to run lint + tests"
    output: selected_task

  - name: "Execute CLI Task"
    type: shell
    command: "node scripts/run-agent.mjs cli-developer ${selected_task}"
    cwd: "${workspace}"

  - name: "Verify Success Criteria"
    type: check
    conditions:
      - "CLI commands work on clean checkout"
      - "CI passes on push with coverage >=90%"
      - "Help text complete and accurate"

success_message: " CLI development task completed successfully"
error_message: " CLI development task failed - check logs in .shep/logs/"
