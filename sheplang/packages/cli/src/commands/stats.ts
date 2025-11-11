import { performance } from 'node:perf_hooks';
import fs from 'node:fs/promises';
import path from 'node:path';
import { bold, green, yellow, red, cyan, gray } from 'kleur/colors';

interface DxMetrics {
  timestamp?: string;
  totalBuilds?: number;
  errors?: number;
  averages?: {
    parse?: number;
    transpile?: number;
    reload?: number;
    total?: number;
  };
  lastBuild?: number;
  hmrLatency?: number;
}

interface CodeStats {
  totalFiles: number;
  totalSize: number;
  extensionCounts: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
  avgFileSize: number;
}

interface BuildStats {
  avgBuildTime: number;
  lastBuildTime: number;
  totalBuilds: number;
  errorRate: number;
  hmrLatency: number;
}

interface FullReport extends DxMetrics {
  codeStats: CodeStats;
  buildStats: BuildStats;
  codebaseHealth: {
    rating: string;
    score: number;
    factors: Array<{ name: string; score: number; note: string }>;
  };
  timestamp: string;
  scanDuration: number;
}

/**
 * Enhanced stats command that generates comprehensive DX metrics
 */
export async function statsCommand(): Promise<void> {
  console.log(bold('\n🔍 ShepLang DX Metrics Scanner\n'));
  
  const startTime = performance.now();
  let dxMetrics: DxMetrics = {};
  
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join('.shep', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    // Try to load existing DX metrics
    try {
      const metricsPath = path.join(reportsDir, 'dx.json');
      const metricsContent = await fs.readFile(metricsPath, 'utf-8');
      dxMetrics = JSON.parse(metricsContent);
      console.log(cyan('✓ Loaded existing DX metrics'));
    } catch (e) {
      console.log(yellow('ℹ No existing DX metrics found, generating from scratch'));
    }
    
    // Scan codebase
    console.log(cyan('\n📊 Scanning codebase...'));
    const files = await walk('.', [], ['.git', 'node_modules', 'dist']);
    
    // Calculate file statistics
    const codeStats = await calculateCodeStats(files);
    console.log(`${green('✓')} Found ${bold(String(codeStats.totalFiles))} files`);
    console.log(`${green('✓')} Total codebase size: ${formatSize(codeStats.totalSize)}`);
    
    // Calculate build statistics from DX metrics
    const buildStats = calculateBuildStats(dxMetrics);
    
    // Calculate codebase health metrics
    const health = calculateCodebaseHealth(codeStats, buildStats);
    
    // Generate full report
    const endTime = performance.now();
    const fullReport: FullReport = {
      ...dxMetrics,
      codeStats,
      buildStats,
      codebaseHealth: health,
      timestamp: new Date().toISOString(),
      scanDuration: endTime - startTime
    };
    
    // Save the report
    const reportPath = path.join(reportsDir, 'dx-report.json');
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    
    // Output summary to console
    console.log('\n📝 DX Metrics Summary:')
    console.log(`  ${cyan('Codebase size:')} ${bold(formatSize(codeStats.totalSize))} (${codeStats.totalFiles} files)`);
    
    console.log('\n  File distribution:');
    const sortedExtensions = Object.entries(codeStats.extensionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
      
    sortedExtensions.forEach(([ext, count]) => {
      console.log(`    ${yellow(ext || '(no ext)')}: ${count} files`);
    });
    
    if (buildStats.totalBuilds > 0) {
      console.log('\n  Build metrics:');
      console.log(`    ${cyan('Avg build time:')} ${yellow(buildStats.avgBuildTime.toFixed(2) + 'ms')}`);
      console.log(`    ${cyan('HMR latency:')} ${yellow(buildStats.hmrLatency.toFixed(2) + 'ms')}`);
      console.log(`    ${cyan('Total builds:')} ${buildStats.totalBuilds}`);
      console.log(`    ${cyan('Error rate:')} ${formatErrorRate(buildStats.errorRate)}`);
    } else {
      console.log('\n  No build metrics available yet.');
    }
    
    console.log('\n  Codebase health:');
    console.log(`    ${cyan('Health score:')} ${formatHealthScore(health.score)}`);
    console.log(`    ${cyan('Rating:')} ${formatHealthRating(health.rating)}`);
    
    console.log('\n  Top factors affecting DX:');
    health.factors.slice(0, 3).forEach(factor => {
      console.log(`    • ${bold(factor.name)}: ${factor.note}`);
    });
    
    console.log(`\n${green('✓')} Full report saved to ${yellow(reportPath)}`);
    console.log(`${green('✓')} Scan completed in ${yellow((endTime - startTime).toFixed(2) + 'ms')}\n`);
  } catch (error) {
    console.error(red(`Error generating DX metrics: ${error instanceof Error ? error.message : String(error)}`));
  }
}

/**
 * Walk directory and collect files
 */
async function walk(dir: string, arr: string[] = [], exclude: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip excluded directories
      if (exclude.includes(entry.name)) continue;
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath, arr, exclude);
      } else {
        arr.push(fullPath);
      }
    }
  } catch (e) {
    // Skip directories we can't access
  }
  
  return arr;
}

/**
 * Calculate code statistics
 */
async function calculateCodeStats(files: string[]): Promise<CodeStats> {
  let totalSize = 0;
  const extensionCounts: Record<string, number> = {};
  const fileSizes: Array<{ path: string; size: number }> = [];
  
  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      const size = stats.size;
      totalSize += size;
      
      const ext = path.extname(file).toLowerCase() || '(none)';
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      
      fileSizes.push({ path: file, size });
    } catch (e) {
      // Skip files we can't access
    }
  }
  
  // Sort files by size and get the largest 5
  const largestFiles = fileSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
    
  return {
    totalFiles: files.length,
    totalSize,
    extensionCounts,
    largestFiles,
    avgFileSize: totalSize / files.length || 0
  };
}

/**
 * Calculate build statistics from DX metrics
 */
function calculateBuildStats(metrics: DxMetrics): BuildStats {
  const avgTime = (metrics.averages?.total ?? 0);
  const lastTime = metrics.lastBuild ?? 0;
  const totalBuilds = metrics.totalBuilds ?? 0;
  const errors = metrics.errors ?? 0;
  const errorRate = totalBuilds > 0 ? errors / totalBuilds : 0;
  const hmrLatency = metrics.hmrLatency ?? 0;
  
  return {
    avgBuildTime: avgTime,
    lastBuildTime: lastTime,
    totalBuilds,
    errorRate,
    hmrLatency
  };
}

/**
 * Calculate codebase health score
 */
function calculateCodebaseHealth(codeStats: CodeStats, buildStats: BuildStats) {
  const factors: Array<{ name: string; score: number; note: string; weight: number }> = [];
  
  // Factor 1: Build time
  const buildTimeScore = buildStats.totalBuilds > 0
    ? buildStats.avgBuildTime < 500 ? 100 : 
      buildStats.avgBuildTime < 1000 ? 80 : 
      buildStats.avgBuildTime < 2000 ? 60 : 
      buildStats.avgBuildTime < 5000 ? 40 : 20
    : 50; // No builds yet, neutral score
  
  factors.push({
    name: 'Build Time',
    score: buildTimeScore,
    note: buildStats.totalBuilds > 0
      ? `Avg: ${buildStats.avgBuildTime.toFixed(2)}ms (${scoreToRating(buildTimeScore)})`
      : 'No builds recorded yet',
    weight: 0.4
  });
  
  // Factor 2: HMR Latency
  const hmrScore = buildStats.totalBuilds > 0
    ? buildStats.hmrLatency < 100 ? 100 :
      buildStats.hmrLatency < 300 ? 80 :
      buildStats.hmrLatency < 500 ? 60 :
      buildStats.hmrLatency < 1000 ? 40 : 20
    : 50; // No data yet
    
  factors.push({
    name: 'HMR Latency',
    score: hmrScore,
    note: buildStats.totalBuilds > 0
      ? `${buildStats.hmrLatency.toFixed(2)}ms (${scoreToRating(hmrScore)})`
      : 'No HMR data yet',
    weight: 0.3
  });
  
  // Factor 3: Error Rate
  const errorScore = buildStats.totalBuilds > 0
    ? buildStats.errorRate < 0.05 ? 100 :
      buildStats.errorRate < 0.1 ? 80 :
      buildStats.errorRate < 0.2 ? 60 :
      buildStats.errorRate < 0.3 ? 40 : 20
    : 50; // No data
    
  factors.push({
    name: 'Build Reliability',
    score: errorScore,
    note: buildStats.totalBuilds > 0
      ? `${(buildStats.errorRate * 100).toFixed(1)}% error rate (${scoreToRating(errorScore)})`
      : 'No build data yet',
    weight: 0.3
  });
  
  // Factor 4: Codebase Size
  const sizeScore = 
    codeStats.totalSize < 1024 * 1024 ? 100 :
    codeStats.totalSize < 5 * 1024 * 1024 ? 80 :
    codeStats.totalSize < 10 * 1024 * 1024 ? 60 :
    codeStats.totalSize < 50 * 1024 * 1024 ? 40 : 20;
    
  factors.push({
    name: 'Codebase Size',
    score: sizeScore,
    note: `${formatSize(codeStats.totalSize)} (${scoreToRating(sizeScore)})`,
    weight: 0.2
  });
  
  // Factor 5: File Count
  const fileCountScore = 
    codeStats.totalFiles < 50 ? 100 :
    codeStats.totalFiles < 200 ? 80 :
    codeStats.totalFiles < 500 ? 60 :
    codeStats.totalFiles < 1000 ? 40 : 20;
    
  factors.push({
    name: 'File Organization',
    score: fileCountScore,
    note: `${codeStats.totalFiles} files (${scoreToRating(fileCountScore)})`,
    weight: 0.1
  });
  
  // Calculate weighted score
  const weightedScores = factors.map(f => f.score * f.weight);
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const overallScore = weightedScores.reduce((sum, s) => sum + s, 0) / totalWeight;
  
  // Determine rating
  const rating = scoreToRating(overallScore);
  
  return {
    score: overallScore,
    rating,
    factors: factors.map(({ name, score, note }) => ({ name, score, note }))
      .sort((a, b) => a.score - b.score) // Sort by score ascending (worst first)
  };
}

/**
 * Format a size in bytes to a human readable string
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

/**
 * Format error rate with color
 */
function formatErrorRate(rate: number): string {
  if (rate === 0) return green('0%');
  if (rate < 0.05) return green((rate * 100).toFixed(1) + '%');
  if (rate < 0.1) return yellow((rate * 100).toFixed(1) + '%');
  return red((rate * 100).toFixed(1) + '%');
}

/**
 * Convert score to rating string
 */
function scoreToRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Below Average';
  return 'Poor';
}

/**
 * Format health score with color
 */
function formatHealthScore(score: number): string {
  if (score >= 90) return green(score.toFixed(1) + '/100');
  if (score >= 75) return green(score.toFixed(1) + '/100');
  if (score >= 60) return yellow(score.toFixed(1) + '/100');
  if (score >= 40) return yellow(score.toFixed(1) + '/100');
  return red(score.toFixed(1) + '/100');
}

/**
 * Format health rating with color
 */
function formatHealthRating(rating: string): string {
  switch(rating) {
    case 'Excellent': return green(rating);
    case 'Good': return green(rating);
    case 'Average': return yellow(rating);
    case 'Below Average': return yellow(rating);
    case 'Poor': return red(rating);
    default: return rating;
  }
}
