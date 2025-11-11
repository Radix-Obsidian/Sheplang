import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseAndMap } from '@sheplang/language';
import { transpileToTS } from '@sheplang/transpiler';
// Temporary type declarations until runtime package is fully integrated
interface RuntimeServer {
  url: string;
  reload: () => Promise<void>;
  close: () => Promise<void>;
  getMetrics?: () => Record<string, any>;
}
interface RuntimeServerOptions {
  hmr?: boolean;
  port?: number;
}
// Mock runtime server for type compatibility
const runRuntimeServer = async (entryPath: string, options?: RuntimeServerOptions): Promise<RuntimeServer> => {
  console.log(yellow('⚠️ Using mock runtime server (runtime package not integrated yet)'));
  return {
    url: `http://localhost:${options?.port || 8787}`,
    reload: async () => console.log('Mock reload'),
    close: async () => console.log('Mock close')
  };
};
import { bold, green, yellow, red, cyan } from 'kleur/colors';

/**
 * Performance metrics for DX optimization
 */
interface DevMetrics {
  totalBuilds: number;
  parseTimeMs: number[];
  transpileTimeMs: number[];
  reloadTimeMs: number[];
  errors: number;
  avgParseTimeMs: number;
  avgTranspileTimeMs: number;
  avgReloadTimeMs: number;
  lastBuildTimeMs: number;
}

const metrics: DevMetrics = {
  totalBuilds: 0,
  parseTimeMs: [],
  transpileTimeMs: [],
  reloadTimeMs: [],
  errors: 0,
  avgParseTimeMs: 0,
  avgTranspileTimeMs: 0,
  avgReloadTimeMs: 0,
  lastBuildTimeMs: 0
};

/**
 * Enhanced dev command with fast HMR and DX metrics
 */
export async function devCommand(file: string): Promise<void> {
  // Ensure .shep/reports directory exists
  const reportsDir = path.join(process.cwd(), '.shep', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  console.log(bold('🚀 ShepLang Dev Server'));
  console.log(`📄 Source: ${cyan(file)}`);

  try {
    const startTime = performance.now();
    const parseStart = performance.now();
    
    // Parse the ShepLang file
    const contents = await fs.readFile(file, 'utf8');
    const { appModel, diagnostics } = await parseAndMap(contents, 'file://' + file);
    
    const parseEnd = performance.now();
    metrics.parseTimeMs.push(parseEnd - parseStart);
    
    if (!appModel || diagnostics.length) {
      console.error(red('❌ Parse errors:'));
      diagnostics.forEach(d => console.error(`  ${d.message} at ${d.line}:${d.column}`));
      metrics.errors++;
      process.exit(1);
    }
    
    // Transpile to TypeScript
    const transpileStart = performance.now();
    const { entryPath } = await transpileToTS(appModel, { generateSnapshots: true });
    const transpileEnd = performance.now();
    metrics.transpileTimeMs.push(transpileEnd - transpileStart);
    
    // Start the dev server
    const serverStart = performance.now();
    const server = await runRuntimeServer(entryPath, { hmr: true });
    const serverEnd = performance.now();
    
    const totalTime = performance.now() - startTime;
    metrics.totalBuilds++;
    metrics.lastBuildTimeMs = totalTime;
    
    // Calculate averages
    metrics.avgParseTimeMs = metrics.parseTimeMs.reduce((a, b) => a + b, 0) / metrics.parseTimeMs.length;
    metrics.avgTranspileTimeMs = metrics.transpileTimeMs.reduce((a, b) => a + b, 0) / metrics.transpileTimeMs.length;
    
    console.log(`\n✨ ${green('ShepLang dev server started!')}`);
    console.log(`🔗 URL: ${cyan(server.url)}`);
    console.log(`⏱️  Initial build: ${yellow(totalTime.toFixed(2) + 'ms')}`);
    console.log(`   - Parse: ${yellow(metrics.parseTimeMs[0].toFixed(2) + 'ms')}`);
    console.log(`   - Transpile: ${yellow(metrics.transpileTimeMs[0].toFixed(2) + 'ms')}`);
    console.log(`   - Server: ${yellow((serverEnd - serverStart).toFixed(2) + 'ms')}\n`);

    // Set up the file watcher with debounced rebuilds
    let rebuildTimer: NodeJS.Timeout | undefined;
    const watcher = chokidar.watch(file, { 
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 10 }
    });
    
    watcher.on('change', async () => {
      // Clear previous rebuild timer
      if (rebuildTimer) clearTimeout(rebuildTimer);
      
      // Debounce rebuilds (wait 50ms for stabilization)
      rebuildTimer = setTimeout(async () => {
        const rebuildStart = performance.now();
        console.log(cyan('🔄 File changed, rebuilding...'));
        
        try {
          // Parse
          const parseStart = performance.now();
          const src = await fs.readFile(file, 'utf8');
          const res = await parseAndMap(src, 'file://' + file);
          const parseTime = performance.now() - parseStart;
          metrics.parseTimeMs.push(parseTime);
          
          if (!res.appModel || res.diagnostics.length) {
            console.error(red('❌ Parse errors:'));
            res.diagnostics.forEach(d => 
              console.error(`  ${d.message} at ${d.line}:${d.column}`));
            metrics.errors++;
            return;
          }
          
          // Transpile
          const transpileStart = performance.now();
          const { entryPath } = await transpileToTS(res.appModel, { generateSnapshots: true });
          const transpileTime = performance.now() - transpileStart;
          metrics.transpileTimeMs.push(transpileTime);
          
          // Reload
          const reloadStart = performance.now();
          await server.reload();
          const reloadTime = performance.now() - reloadStart;
          metrics.reloadTimeMs.push(reloadTime);
          
          // Update metrics
          metrics.totalBuilds++;
          metrics.lastBuildTimeMs = performance.now() - rebuildStart;
          metrics.avgParseTimeMs = metrics.parseTimeMs.reduce((a, b) => a + b, 0) / metrics.parseTimeMs.length;
          metrics.avgTranspileTimeMs = metrics.transpileTimeMs.reduce((a, b) => a + b, 0) / metrics.transpileTimeMs.length;
          metrics.avgReloadTimeMs = metrics.reloadTimeMs.reduce((a, b) => a + b, 0) / metrics.reloadTimeMs.length;
          
          // Log performance
          console.log(green('✅ Rebuilt successfully!'));
          console.log(`⏱️  Time: ${yellow(metrics.lastBuildTimeMs.toFixed(2) + 'ms')}`);
          
          // Save metrics every 5 builds
          if (metrics.totalBuilds % 5 === 0) {
            await saveDxMetrics();
          }
        } catch (e) {
          metrics.errors++;
          console.error(red(`❌ Rebuild failed: ${e instanceof Error ? e.message : String(e)}`));
        }
      }, 50);
    });
    
    // Save initial metrics
    await saveDxMetrics();
    
    // Handle process exit
    process.on('SIGINT', async () => {
      await saveDxMetrics();
      console.log(cyan('\n👋 ShepLang dev server stopped.'));
      process.exit(0);
    });
    
  } catch (e) {
    console.error(red(`❌ Dev server failed: ${e instanceof Error ? e.message : String(e)}`));
    process.exit(1);
  }
}

/**
 * Save DX metrics to file for analysis
 */
async function saveDxMetrics(): Promise<void> {
  try {
    const metricsPath = path.join(process.cwd(), '.shep', 'reports', 'dx.json');
    
    // Calculate statistical data
    const summary = {
      timestamp: new Date().toISOString(),
      totalBuilds: metrics.totalBuilds,
      errors: metrics.errors,
      averages: {
        parse: metrics.avgParseTimeMs,
        transpile: metrics.avgTranspileTimeMs,
        reload: metrics.avgReloadTimeMs,
        total: metrics.avgParseTimeMs + metrics.avgTranspileTimeMs + metrics.avgReloadTimeMs
      },
      lastBuild: metrics.lastBuildTimeMs,
      hmrLatency: metrics.reloadTimeMs.length > 0 ? 
        metrics.reloadTimeMs[metrics.reloadTimeMs.length - 1] : 0
    };
    
    await fs.writeFile(metricsPath, JSON.stringify(summary, null, 2), 'utf8');
  } catch (e) {
    console.error(`Failed to save metrics: ${e instanceof Error ? e.message : String(e)}`);
  }
}
