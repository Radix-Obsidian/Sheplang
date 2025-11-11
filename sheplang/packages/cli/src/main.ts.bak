import fs from 'node:fs/promises';
import path from 'node:path';
import { bold, green, cyan, red, yellow, gray, magenta } from 'kleur/colors';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { explainCommand } from './commands/explain';
import { formatCommand } from './commands/format';
import { statsCommand } from './commands/stats';

// CLI version
const VERSION = '1.0.0';

// Exit code constants
const EXIT = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_USAGE: 2,
  FILE_NOT_FOUND: 3,
  COMPILATION_ERROR: 4
};

/**
 * Check if a file exists and has .shep extension
 */
async function validateShepFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Resolve to absolute path if relative
    const resolvedPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    // Check file extension
    if (!resolvedPath.toLowerCase().endsWith('.shep')) {
      return { valid: false, error: 'File must have .shep extension' };
    }
    
    // Check if file exists
    await fs.access(resolvedPath);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'File not found' };
  }
}

/**
 * Parse command line arguments with support for flags
 */
function parseArgs(args: string[]): { 
  file?: string;
  flags: Record<string, string | boolean>;
} {
  const file = args.find(arg => !arg.startsWith('-'));
  const flags: Record<string, string | boolean> = {};
  
  args.filter(arg => arg.startsWith('-')).forEach(arg => {
    if (arg.startsWith('--')) {
      // Handle --flag=value or --flag
      const [key, value] = arg.slice(2).split('=');
      flags[key] = value === undefined ? true : value;
    } else {
      // Handle -f or -f value
      const key = arg.slice(1);
      flags[key] = true;
    }
  });
  
  return { file, flags };
}

/**
 * Display error message and exit
 */
function handleError(message: string, exitCode = EXIT.ERROR): never {
  console.error(`\n${red('✘')} ${message}\n`);
  process.exit(exitCode);
}

/**
 * Display version information
 */
function showVersion(): void {
  console.log(`ShepLang CLI v${VERSION}`);
}

/**
 * Display help information
 */
function showHelp(command?: string): void {
  console.log(`\n${bold(magenta('✦ ShepLang CLI'))} ${gray(`v${VERSION}`)}\n`);
  
  if (command) {
    switch (command) {
      case 'dev':
        console.log(bold('Development server:\n'));
        console.log(`  ${cyan('sheplang dev <file.shep>')} [options]`);
        console.log('\nOptions:');
        console.log(`  ${yellow('--port=<number>')}     Port for dev server (default: 8787)`);
        console.log(`  ${yellow('--open')}              Open in browser automatically`);
        console.log(`  ${yellow('--no-hmr')}            Disable hot module replacement`);
        console.log('\nExample:');
        console.log(`  ${gray('sheplang dev app.shep --port=3000 --open')}\n`);
        break;
        
      case 'build':
        console.log(bold('Build a ShepLang application:\n'));
        console.log(`  ${cyan('sheplang build <file.shep>')} [options]`);
        console.log('\nOptions:');
        console.log(`  ${yellow('--out=<dir>')}         Output directory (default: .shep/out)`);
        console.log(`  ${yellow('--snapshot')}          Generate snapshots for comparison`);
        console.log('\nExample:');
        console.log(`  ${gray('sheplang build app.shep --out=dist --snapshot')}\n`);
        break;
        
      case 'explain':
        console.log(bold('Generate documentation:\n'));
        console.log(`  ${cyan('sheplang explain <file.shep>')} [options]`);
        console.log('\nOptions:');
        console.log(`  ${yellow('--out=<dir>')}         Output directory (default: .shep/docs)`);
        console.log('\nExample:');
        console.log(`  ${gray('sheplang explain app.shep --out=docs')}\n`);
        break;
        
      case 'format':
        console.log(bold('Format ShepLang files:\n'));
        console.log(`  ${cyan('sheplang format [file.shep]')} [options]`);
        console.log('\nOptions:');
        console.log(`  ${yellow('--write')}             Write changes to files (default: false)`);
        console.log(`  ${yellow('--ignore-path=<file>')} Path to ignore file`);
        console.log('\nExample:');
        console.log(`  ${gray('sheplang format app.shep --write')}\n`);
        break;
        
      case 'stats':
        console.log(bold('Show DX metrics:\n'));
        console.log(`  ${cyan('sheplang stats')} [options]`);
        console.log('\nOptions:');
        console.log(`  ${yellow('--json')}              Output as JSON`);
        console.log('\nExample:');
        console.log(`  ${gray('sheplang stats --json > dx-metrics.json')}\n`);
        break;
        
      default:
        showGeneralHelp();
    }
  } else {
    showGeneralHelp();
  }
}

/**
 * Display general help information
 */
function showGeneralHelp(): void {
  console.log('Usage: sheplang <command> [options]\n');
  console.log('Commands:');
  console.log(`  ${cyan('dev')}      Start development server with HMR`);
  console.log(`  ${cyan('build')}    Generate TypeScript output from ShepLang`);
  console.log(`  ${cyan('explain')}  Generate documentation for a ShepLang app`);
  console.log(`  ${cyan('format')}   Format ShepLang files`);
  console.log(`  ${cyan('stats')}    Show developer experience metrics`);
  console.log('');
  console.log(`Run ${yellow('sheplang help <command>')} for command-specific help\n`);
  console.log(`Examples:`);
  console.log(`  ${gray('sheplang dev app.shep')}`);
  console.log(`  ${gray('sheplang build app.shep --out=dist')}\n`);
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  try {
    const [, , cmd, ...rawArgs] = process.argv;
    
    // Parse arguments
    const { file, flags } = parseArgs(rawArgs);
    
    // Handle version flag
    if (flags.v || flags.version) {
      showVersion();
      process.exit(EXIT.SUCCESS);
    }
    
    // Handle help command or flag
    if (cmd === 'help' || flags.h || flags.help) {
      showHelp(cmd === 'help' ? file : undefined);
      process.exit(EXIT.SUCCESS);
    }
    
    // Default to showing help if no command provided
    if (!cmd) {
      showGeneralHelp();
      process.exit(EXIT.SUCCESS);
    }
    
    // Special handling for verbose mode
    const verbose = Boolean(flags.verbose);
    if (verbose) {
      console.log(`${cyan('ℹ')} Verbose mode enabled`);
    }
    
    // Command execution
    switch (cmd) {
      case 'dev': {
        const filePath = file ?? 'examples/todo.shep';
        const validation = await validateShepFile(filePath);
        
        if (!validation.valid) {
          handleError(`Invalid ShepLang file: ${validation.error}`, EXIT.FILE_NOT_FOUND);
        }
        
        const port = flags.port ? Number(flags.port) : undefined;
        const hmr = flags['no-hmr'] ? false : true;
        const open = Boolean(flags.open);
        
        console.log(`${cyan('ℹ')} Starting dev server for ${yellow(filePath)}${port ? ` on port ${port}` : ''}`);
        await devCommand(filePath);
        break;
      }
        
      case 'build': {
        const filePath = file ?? 'examples/todo.shep';
        const validation = await validateShepFile(filePath);
        
        if (!validation.valid) {
          handleError(`Invalid ShepLang file: ${validation.error}`, EXIT.FILE_NOT_FOUND);
        }
        
        const outDir = flags.out ? String(flags.out) : undefined;
        const snapshots = Boolean(flags.snapshot);
        
        console.log(`${cyan('ℹ')} Building ${yellow(filePath)}${outDir ? ` to ${outDir}` : ''}`);
        await buildCommand(filePath);
        break;
      }
        
      case 'explain': {
        const filePath = file ?? 'examples/todo.shep';
        const validation = await validateShepFile(filePath);
        
        if (!validation.valid) {
          handleError(`Invalid ShepLang file: ${validation.error}`, EXIT.FILE_NOT_FOUND);
        }
        
        console.log(`${cyan('ℹ')} Generating docs for ${yellow(filePath)}`);
        await explainCommand(filePath);
        break;
      }
        
      case 'format': {
        const filePath = file;
        const write = Boolean(flags.write);
        
        if (filePath) {
          const validation = await validateShepFile(filePath);
          
          if (!validation.valid) {
            handleError(`Invalid ShepLang file: ${validation.error}`, EXIT.FILE_NOT_FOUND);
          }
          
          console.log(`${cyan('ℹ')} Formatting ${yellow(filePath)}${write ? ' and writing changes' : ''}`);
        } else {
          console.log(`${cyan('ℹ')} Formatting all ShepLang files${write ? ' and writing changes' : ''}`);
        }
        
        await formatCommand();
        break;
      }
        
      case 'stats': {
        const jsonOutput = Boolean(flags.json);
        
        console.log(`${cyan('ℹ')} Generating DX metrics${jsonOutput ? ' in JSON format' : ''}`);
        await statsCommand();
        break;
      }
        
      default:
        console.log(`${yellow('⚠')} Unknown command: ${cmd}\n`);
        showGeneralHelp();
        process.exit(EXIT.INVALID_USAGE);
    }
    
    process.exit(EXIT.SUCCESS);
  } catch (error) {
    handleError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
