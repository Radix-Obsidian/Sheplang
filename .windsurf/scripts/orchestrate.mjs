#!/usr/bin/env node
/**
 * orchestrate.mjs
 * Orchestrates multi-agent execution based on phase routing rules.
 * Usage: node scripts/orchestrate.mjs <agent-name> <task> [phase]
 */

import { readFileSync, existsSync, mkdirSync, appendFileSync, writeFileSync } from 'fs';
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
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const LOG_DIR = join(ROOT, '.shep', 'logs');
const LOG_FILE = join(LOG_DIR, 'orchestrator.log');

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

function log(level, message, details = '', logToFile = true) {
  const timestamp = new Date().toISOString();
  const levelColors = {
    INFO: colors.cyan,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARN: colors.yellow,
    PHASE: colors.magenta,
    AGENT: colors.blue,
  };
  const color = levelColors[level] || colors.reset;
  const logLine = `[${timestamp}] ${level} ${message}${details ? ' | ' + details : ''}`;
  
  // Console output with colors
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`);
  if (details) {
    console.log(`  ${colors.gray}${details}${colors.reset}`);
  }
  
  // File output without colors
  if (logToFile) {
    appendFileSync(LOG_FILE, logLine + '\n');
  }
}

function parseYAML(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const result = {};

  let currentSection = null;
  let currentRule = null;
  let currentSequence = [];
  let inSequence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    // Count leading spaces to determine indentation level
    const leadingSpaces = line.length - line.trimLeft().length;

    // Detect key-value pairs at root level
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match && leadingSpaces === 0) {
      const [, key, value] = match;

      if (key === 'routing_rules' || key === 'routes') {
        // Finalize previous routing_rules section before starting new section
        if (currentSection === 'routing_rules' && currentRule) {
          if (currentSequence.length > 0) {
            currentRule.sequence = [...currentSequence];
          }
          result.routing_rules.push(currentRule);
          currentRule = null;
          currentSequence = [];
          inSequence = false;
        }
        currentSection = key;
        result[key] = [];
        inSequence = false;
      } else if (key === 'orchestration') {
        // Finalize previous routing_rules section before starting orchestration
        if (currentSection === 'routing_rules' && currentRule) {
          if (currentSequence.length > 0) {
            currentRule.sequence = [...currentSequence];
          }
          result.routing_rules.push(currentRule);
          currentRule = null;
          currentSequence = [];
          inSequence = false;
        }
        currentSection = 'orchestration';
        result[key] = {};
        inSequence = false;
      } else if (key === 'defaults') {
        currentSection = 'defaults';
        result[key] = {};
        inSequence = false;
      } else {
        result[key] = value.replace(/"/g, '');
      }
    } else if (currentSection === 'routing_rules') {
      // Handle routing rules section
      if (trimmed.startsWith('- when:')) {
        // Finalize the previous rule before starting a new one
        if (currentRule) {
          if (currentSequence.length > 0) {
            currentRule.sequence = [...currentSequence];
          }
          result.routing_rules.push(currentRule);
        }
        currentRule = {
          when: trimmed.substring(7).trim().replace(/"/g, ''),
          sequence: [],
        };
        currentSequence = [];
        inSequence = false;
      } else if (trimmed === 'sequence:') {
        inSequence = true;
      } else if (inSequence && trimmed.startsWith('- agent:')) {
        const agentName = trimmed.substring(8).trim().replace(/"/g, '').split('#')[0].trim();
        const agentTask = { agent: agentName, task: '' };
        currentSequence.push(agentTask);
      } else if (inSequence && leadingSpaces >= 6 && trimmed.startsWith('task:')) {
        if (currentSequence.length > 0) {
          currentSequence[currentSequence.length - 1].task = trimmed.substring(5).trim().replace(/"/g, '');
        }
      }
    } else if (currentSection === 'routes' && trimmed.startsWith('- match:')) {
      if (currentRule) {
        result.routes.push(currentRule);
      }
      currentRule = { match: {}, send: {} };
    } else if (currentSection === 'routes' && trimmed.startsWith('task:')) {
      if (currentRule && currentRule.match !== undefined) {
        currentRule.match.task = trimmed.substring(5).trim().replace(/"/g, '');
      }
    } else if (currentSection === 'routes' && trimmed.startsWith('send:')) {
      // Send section start
    } else if (currentSection === 'routes' && leadingSpaces >= 4 && trimmed.startsWith('agent:')) {
      if (currentRule && currentRule.send !== undefined) {
        currentRule.send.agent = trimmed.substring(6).trim().replace(/"/g, '');
      }
    } else if (currentSection === 'orchestration') {
      const match = trimmed.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (key === 'abort_on_fail') {
          result.orchestration[key] = value === 'true';
        } else {
          result.orchestration[key] = value.replace(/"/g, '');
        }
      }
    } else if (currentSection === 'defaults' && trimmed.startsWith('on_unknown:')) {
      result.defaults.on_unknown = {};
    } else if (currentSection === 'defaults' && leadingSpaces >= 2 && trimmed.startsWith('agent:')) {
      result.defaults.on_unknown.agent = trimmed.substring(6).trim().replace(/"/g, '');
    }
  }

  return result;
}

function runAgent(agentName, taskId) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['scripts/run-agent.mjs', agentName, taskId], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('error', (error) => {
      reject(error);
    });

    proc.on('close', (code) => {
      if (code === 0 || code === 2) { // 0 = success, 2 = pending implementation
        resolve({ success: true, exitCode: code });
      } else {
        reject(new Error(`Agent ${agentName} failed with exit code ${code}`));
      }
    });
  });
}

async function executePhase(orchestrator, phase) {
  log('PHASE', `Starting phase orchestration: ${colors.bright}${phase}${colors.reset}`);
  
  const rule = orchestrator.routing_rules.find(r => r.when === `phase=${phase}`);
  
  if (!rule) {
    log('ERROR', `No routing rule found for phase: ${phase}`);
    throw new Error(`No routing rule for phase=${phase}`);
  }

  const sequence = rule.sequence;
  const abortOnFail = orchestrator.orchestration?.abort_on_fail ?? true;
  
  log('INFO', `Executing ${sequence.length} agent(s) in sequence`, `abort_on_fail: ${abortOnFail}`);
  console.log();

  const results = [];
  
  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    const stepNum = i + 1;
    
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}Step ${stepNum}/${sequence.length}:${colors.reset} ${colors.blue}${step.agent}${colors.reset} → ${colors.yellow}${step.task}${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    log('AGENT', `Executing: ${step.agent}`, `Task: ${step.task}`);
    
    try {
      const result = await runAgent(step.agent, step.task);
      results.push({
        agent: step.agent,
        task: step.task,
        success: true,
        exitCode: result.exitCode,
      });
      
      log('SUCCESS', `Agent ${step.agent} completed successfully`);
      
    } catch (error) {
      results.push({
        agent: step.agent,
        task: step.task,
        success: false,
        error: error.message,
      });
      
      log('ERROR', `Agent ${step.agent} failed`, error.message);
      
      if (abortOnFail) {
        log('ERROR', 'Aborting orchestration due to failure', `abort_on_fail: ${abortOnFail}`);
        console.log(`\n${colors.red}✗ Orchestration aborted after ${stepNum}/${sequence.length} steps${colors.reset}\n`);
        throw error;
      } else {
        log('WARN', 'Continuing despite failure', `abort_on_fail: ${abortOnFail}`);
      }
    }
    
    console.log();
  }

  return results;
}

function findTaskRoute(routes, taskName) {
  const route = routes.find(r => {
    const matchTask = r.match?.task?.toLowerCase();
    const searchTask = taskName.toLowerCase();
    return matchTask && (
      matchTask === searchTask ||
      matchTask.includes(searchTask) ||
      searchTask.includes(matchTask)
    );
  });
  return route?.send;
}

async function executeTask(orchestratorRoutes, taskName) {
  log('INFO', `Looking up task route: ${taskName}`);
  
  const send = findTaskRoute(orchestratorRoutes.routes, taskName);
  
  if (!send) {
    log('WARN', `No route found for task: ${taskName}`, 'Using default behavior');
    return {
      agent: 'unknown',
      task: taskName,
      success: false,
      error: 'No routing rule found',
    };
  }

  log('INFO', `Routing to agent: ${send.agent}`, `Task: ${send.task}`);
  
  try {
    await runAgent(send.agent, send.task);
    return {
      agent: send.agent,
      task: send.task,
      success: true,
    };
  } catch (error) {
    return {
      agent: send.agent,
      task: send.task,
      success: false,
      error: error.message,
    };
  }
}

function printSummary(results, phase) {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}ORCHESTRATION SUMMARY${colors.reset}${phase ? ` (Phase ${phase})` : ''}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach((result, i) => {
    const status = result.success 
      ? `${colors.green}✓ SUCCESS${colors.reset}` 
      : `${colors.red}✗ FAILED${colors.reset}`;
    console.log(`${i + 1}. ${status} ${colors.blue}${result.agent}${colors.reset} → ${result.task}`);
    if (result.error) {
      console.log(`   ${colors.red}Error: ${result.error}${colors.reset}`);
    }
  });
  
  console.log();
  console.log(`${colors.bright}Results:${colors.reset} ${colors.green}${successful} successful${colors.reset}, ${failed > 0 ? colors.red : colors.gray}${failed} failed${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`${colors.red}Usage: node orchestrate.mjs <agent-name> <task> [phase]${colors.reset}`);
    console.error(`${colors.gray}Examples:${colors.reset}`);
    console.error(`  ${colors.dim}node orchestrate.mjs orchestrator coordinate 2.5${colors.reset}`);
    console.error(`  ${colors.dim}node orchestrate.mjs transpiler-engineer finalize-transpiler${colors.reset}`);
    process.exit(1);
  }

  const [agentName, task, phase] = args;
  
  // Initialize log file
  const startTime = new Date().toISOString();
  writeFileSync(LOG_FILE, `\n${'='.repeat(70)}\nOrchestration started: ${startTime}\n${'='.repeat(70)}\n\n`, { flag: 'a' });
  
  console.log(`${colors.magenta}${colors.bright}`);
  console.log(`╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║              ShepLang Orchestrator v1.0                       ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
  console.log(colors.reset);
  
  log('INFO', 'Orchestrator started', `Agent: ${agentName}, Task: ${task}, Phase: ${phase || 'N/A'}`);

  try {
    let results = [];

    if (agentName === 'orchestrator' && phase) {
      // Phase-based orchestration
      const orchestratorFile = join(ROOT, 'agents', 'orchestrator.yaml');
      const orchestrator = parseYAML(orchestratorFile);
      
      results = await executePhase(orchestrator, phase);
      
    } else if (agentName === 'orchestrator' && !phase) {
      // Task-based routing
      const routesFile = join(ROOT, 'agents', 'orchestrator-routes.yaml');
      const routes = parseYAML(routesFile);
      
      const result = await executeTask(routes, task);
      results = [result];
      
    } else {
      // Direct agent execution (fallback)
      log('INFO', 'Direct agent execution mode');
      await runAgent(agentName, task);
      results = [{ agent: agentName, task, success: true }];
    }

    printSummary(results, phase);
    
    const allSuccessful = results.every(r => r.success);
    
    if (allSuccessful) {
      log('SUCCESS', 'Orchestration completed successfully');
      process.exit(0);
    } else {
      log('ERROR', 'Orchestration completed with failures');
      process.exit(1);
    }
    
  } catch (error) {
    log('ERROR', 'Orchestration failed', error.message);
    console.error(`\n${colors.red}Fatal error:${colors.reset}`);
    console.error(colors.gray + error.stack + colors.reset);
    
    appendFileSync(LOG_FILE, `\nFATAL ERROR: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  } finally {
    const endTime = new Date().toISOString();
    appendFileSync(LOG_FILE, `\n${'='.repeat(70)}\nOrchestration ended: ${endTime}\n${'='.repeat(70)}\n\n`);
  }
}

main();
