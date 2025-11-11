// Simple test script for CLI commands
import { spawn } from 'child_process';
import { join } from 'path';

const cliPath = join(process.cwd(), 'dist', 'index.js');
const examplePath = join(process.cwd(), '..', '..', 'sheplang', 'examples', 'todo.shep');
const commands = [
  ['build', examplePath, '--out=./test_output'],
  ['explain', examplePath],
  ['stats']
];

async function runCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running: node ${cliPath} ${args.join(' ')}`);
    
    const child = spawn('node', [cliPath, ...args], {
      env: { ...process.env },
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Command succeeded: ${args[0]}`);
        resolve();
      } else {
        console.error(`Command failed with code ${code}: ${args[0]}`);
        reject(new Error(`Exit code: ${code}`));
      }
    });
  });
}

async function runTests() {
  try {
    for (const cmd of commands) {
      await runCommand(cmd);
    }
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();
