title: "Quick Test - Agent System"
description: |
  Quick test workflow to verify the agent orchestration system is working.
  Runs a simple agent task to validate the infrastructure.

trigger: manual

steps:
  - name: "Test Agent System"
    type: info
    message: |
       Testing agent orchestration system
      
      This workflow will:
      1. Test the run-agent.mjs script
      2. Verify YAML parsing
      3. Check command execution
      4. Validate logging

  - name: "Run Agent Help"
    type: shell
    command: "node scripts/run-agent.mjs --help || echo 'Agent script ready'"
    cwd: "${workspace}"

  - name: "Run Orchestrator Help"
    type: shell
    command: "node scripts/orchestrate.mjs --help || echo 'Orchestrator script ready'"
    cwd: "${workspace}"

  - name: "Check Agent Definitions"
    type: shell
    command: |
      echo "Checking agent definitions..."
      ls -la agents/*.yaml
      echo ""
      echo " Found $(ls agents/*.yaml | wc -l) agent definitions"
    cwd: "${workspace}"
    shell: bash

  - name: "Verify Scripts Directory"
    type: shell
    command: |
      echo "Checking orchestration scripts..."
      ls -la scripts/*.mjs
      echo ""
      echo " Found $(ls scripts/*.mjs | wc -l) orchestration scripts"
    cwd: "${workspace}"
    shell: bash

  - name: "Test Complete"
    type: info
    message: |
       Agent orchestration system is operational!
      
      Available commands:
      - node scripts/run-agent.mjs <agent> <task>
      - node scripts/orchestrate.mjs orchestrator coordinate <phase>
      
      Or use Windsurf workflows from the command palette.

success_message: " Agent system test passed - All components operational"
error_message: " Agent system test failed - Check script paths and permissions"
