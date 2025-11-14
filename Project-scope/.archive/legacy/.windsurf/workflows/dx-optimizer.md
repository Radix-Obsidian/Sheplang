title: "DX Optimizer Agent"
description: |
  Developer Experience optimizer for ShepLang. Improves the CLI loop,
  hot reload, metrics, and formatting. Reduces latency and friction.
  
  Goals:
  - HMR < 100ms, rebuild < 1s
  - sheplang dev/build/explain/format/stats finalized
  - DX metrics emitted to .shep/reports/dx.json

trigger: manual

steps:
  - name: "Select DX Task"
    type: prompt
    message: "Choose DX optimization task"
    options:
      - value: optimize-dev-loop
        label: "Optimize Dev Loop - Improve dev rebuilds + live preview reload"
      - value: implement-stats
        label: "Implement Stats - Record build/reload metrics to .shep/reports/dx.json"
      - value: format-lint
        label: "Format & Lint - Wire sheplang format + lint integration end-to-end"
    output: selected_task

  - name: "Execute DX Task"
    type: shell
    command: "node scripts/run-agent.mjs dx-optimizer ${selected_task}"
    cwd: "${workspace}"

  - name: "Verify Success Criteria"
    type: check
    conditions:
      - "HMR < 100ms observed"
      - "stats JSON contains timings and file counts"
      - "CLI help lists commands correctly"

success_message: " DX optimization task completed successfully"
error_message: " DX optimization task failed - check logs in .shep/logs/"
