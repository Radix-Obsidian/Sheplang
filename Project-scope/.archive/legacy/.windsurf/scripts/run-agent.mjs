#!/usr/bin/env node
/**
 * run-agent.mjs
 * Executes a single agent task from the agents/ directory.
 * Usage: node scripts/run-agent.mjs <agent-name> <task-id>
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(level, message, details = '') {
  const timestamp = new Date().toISOString();
  const levelColors = {
    INFO: colors.cyan,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARN: colors.yellow,
  };
  const color = levelColors[level] || colors.reset;
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`);
  if (details) {
    console.log(`  ${colors.gray}${details}${colors.reset}`);
  }
}

function parseYAML(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const result = {
    name: '',
    phase: '',
    description: '',
    goals: [],
    tools: [],
    permissions: { fs: { writeAllow: [], readAllow: [] } },
    tasks: [],
    success_criteria: [],
  };

  let currentKey = null;
  let currentTask = null;
  let inDescription = false;
  let inPermissions = false;
  let descriptionBuffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    // Handle multi-line description
    if (inDescription) {
      if (line.match(/^\w+:/)) {
        result.description = descriptionBuffer.trim();
        inDescription = false;
        descriptionBuffer = '';
      } else {
        descriptionBuffer += ' ' + trimmed;
        continue;
      }
    }

    if (trimmed.startsWith('name:')) {
      result.name = trimmed.substring(5).trim();
    } else if (trimmed.startsWith('phase:')) {
      result.phase = trimmed.substring(6).trim().replace(/"/g, '');
    } else if (trimmed.startsWith('description:')) {
      const desc = trimmed.substring(12).trim();
      if (desc === '>') {
        inDescription = true;
      } else {
        result.description = desc;
      }
    } else if (trimmed.startsWith('goals:')) {
      currentKey = 'goals';
    } else if (trimmed.startsWith('tools:')) {
      const toolsStr = trimmed.substring(6).trim();
      result.tools = toolsStr.replace(/[\[\]]/g, '').split(',').map(t => t.trim());
    } else if (trimmed.startsWith('permissions:')) {
      inPermissions = true;
      currentKey = 'permissions';
    } else if (trimmed.startsWith('tasks:')) {
      currentKey = 'tasks';
    } else if (trimmed.startsWith('success_criteria:')) {
      currentKey = 'success_criteria';
    } else if (trimmed.startsWith('- ')) {
      const value = trimmed.substring(2).trim();
      
      if (currentKey === 'goals') {
        result.goals.push(value);
      } else if (currentKey === 'success_criteria') {
        result.success_criteria.push(value.replace(/"/g, ''));
      } else if (currentKey === 'tasks') {
        if (value.startsWith('id:')) {
          if (currentTask) result.tasks.push(currentTask);
          currentTask = { id: value.substring(3).trim(), description: '' };
        }
      }
    } else if (trimmed.startsWith('description:') && currentTask) {
      currentTask.description = trimmed.substring(12).trim().replace(/"/g, '');
    } else if (inPermissions) {
      if (trimmed.startsWith('writeAllow:')) {
        const perms = trimmed.substring(11).trim();
        result.permissions.fs.writeAllow = perms.replace(/[\[\]]/g, '').split(',').map(p => p.trim().replace(/"/g, ''));
      } else if (trimmed.startsWith('readAllow:')) {
        const perms = trimmed.substring(10).trim();
        result.permissions.fs.readAllow = perms.replace(/[\[\]]/g, '').split(',').map(p => p.trim().replace(/"/g, ''));
      }
    }
  }

  if (currentTask) result.tasks.push(currentTask);
  if (inDescription) result.description = descriptionBuffer.trim();

  return result;
}

function executeTask(agent, task) {
  return new Promise((resolve, reject) => {
    log('INFO', `Executing agent: ${colors.bright}${agent.name}${colors.reset}`);
    log('INFO', `Task: ${colors.bright}${task.id}${colors.reset} - ${task.description}`);
    
    // Display goals and permissions
    console.log(`\n${colors.blue}Goals:${colors.reset}`);
    agent.goals.forEach(goal => console.log(`  • ${goal}`));
    
    console.log(`\n${colors.blue}Permissions:${colors.reset}`);
    console.log(`  ${colors.green}Write:${colors.reset} ${agent.permissions.fs.writeAllow.join(', ')}`);
    console.log(`  ${colors.green}Read:${colors.reset} ${agent.permissions.fs.readAllow.join(', ')}`);
    
    console.log(`\n${colors.yellow}▶ Starting task execution...${colors.reset}\n`);

    // Map task ID to actual commands based on task name
    const taskCommands = {
      'finalize-transpiler': ['pnpm', ['--filter', '@sheplang/transpiler', 'build']],
      'snapshots': ['pnpm', ['--filter', '@sheplang/transpiler', 'test', '--', '--updateSnapshot']],
      'verify-determinism': ['node', ['scripts/verify-determinism.mjs']],
      'optimize-dev-loop': ['pnpm', ['--filter', '@sheplang/cli', 'dev']],
      'implement-stats': ['node', ['scripts/implement-stats.mjs']],
      'format-lint': ['pnpm', ['lint']],
      'enforce-ts-only': ['node', ['scripts/enforce-ts-only.mjs']],
      'workspace-build': ['pnpm', ['-w', '-r', 'build']],
      'perf-improve': ['pnpm', ['build']],
      'implement-commands': ['pnpm', ['--filter', '@sheplang/cli', 'build']],
      'cli-ux': ['pnpm', ['--filter', '@sheplang/cli', 'test']],
      'ci-wire': ['node', ['scripts/setup-ci.mjs']],
      'e2e-pipeline': ['pnpm', ['test']],
      'negative-cases': ['pnpm', ['test', '--', '--grep', 'negative']],
      'snapshots-docs': ['pnpm', ['test', '--', '--updateSnapshot']],
    };

    const command = taskCommands[task.id];
    
    if (!command) {
      log('WARN', `No command mapping for task: ${task.id}`, 'Task will be marked as pending implementation');
      console.log(`\n${colors.yellow}⚠ Task requires manual implementation${colors.reset}`);
      console.log(`${colors.gray}To implement this task, add command mapping in run-agent.mjs${colors.reset}\n`);
      resolve({ success: true, status: 'pending_implementation' });
      return;
    }

    const [cmd, args] = command;
    const proc = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('error', (error) => {
      log('ERROR', `Failed to execute command: ${cmd} ${args.join(' ')}`, error.message);
      reject(error);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${colors.green}✓ Task completed successfully${colors.reset}\n`);
        
        // Display success criteria
        if (agent.success_criteria.length > 0) {
          console.log(`${colors.blue}Success Criteria:${colors.reset}`);
          agent.success_criteria.forEach(criterion => {
            console.log(`  ${colors.green}✓${colors.reset} ${criterion}`);
          });
          console.log();
        }
        
        log('SUCCESS', `Agent ${agent.name} completed task: ${task.id}`);
        resolve({ success: true, status: 'completed', exitCode: code });
      } else {
        console.log(`\n${colors.red}✗ Task failed with exit code: ${code}${colors.reset}\n`);
        log('ERROR', `Agent ${agent.name} failed task: ${task.id}`, `Exit code: ${code}`);
        reject(new Error(`Task failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`${colors.red}Usage: node run-agent.mjs <agent-name> <task-id>${colors.reset}`);
    console.error(`${colors.gray}Example: node run-agent.mjs transpiler-engineer finalize-transpiler${colors.reset}`);
    process.exit(1);
  }

  const [agentName, taskId] = args;
  const agentFile = join(ROOT, 'agents', `${agentName}.yaml`);

  try {
    log('INFO', `Loading agent configuration: ${agentName}`);
    const agent = parseYAML(agentFile);
    
    const task = agent.tasks.find(t => t.id === taskId);
    if (!task) {
      log('ERROR', `Task not found: ${taskId}`, `Available tasks: ${agent.tasks.map(t => t.id).join(', ')}`);
      process.exit(1);
    }

    const result = await executeTask(agent, task);
    
    if (result.status === 'pending_implementation') {
      process.exit(2); // Exit code 2 for pending implementation
    }
    
    process.exit(0);
  } catch (error) {
    log('ERROR', 'Agent execution failed', error.message);
    console.error(`\n${colors.red}Stack trace:${colors.reset}`);
    console.error(colors.gray + error.stack + colors.reset);
    process.exit(1);
  }
}

main();
