/**
 * Manifest Generator – Enhanced project detection for Slice 1
 * 
 * Reads package.json, tsconfig, next.config, and prisma schema
 * to emit a structured ImportManifest for analyzers.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ImportManifest, FrameworkDetection } from '../types/ImportManifest';

export interface ManifestGenerationOptions {
  /** Include confidence scores for wizard decisions */
  includeConfidence?: boolean;
  /** Scan for additional patterns (may be slower) */
  deepScan?: boolean;
}

/**
 * Generate ImportManifest from project directory
 */
export async function generateManifest(
  projectRoot: string,
  options: ManifestGenerationOptions = {}
): Promise<ImportManifest> {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in ${projectRoot}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  // Framework detection
  const framework = detectFramework(allDeps, projectRoot);
  
  // TypeScript detection
  const typescript = detectTypeScript(projectRoot);
  
  // Prisma detection
  const prisma = detectPrisma(projectRoot, allDeps);
  
  // Source paths
  const sourcePaths = detectSourcePaths(projectRoot, framework);
  
  // API paths
  const apiPaths = detectApiPaths(projectRoot, framework);
  
  // Confidence scores
  const confidence = calculateConfidence(framework, typescript, prisma);
  
  // Unsupported features
  const unsupported = detectUnsupportedFeatures(projectRoot, allDeps);

  const manifest: ImportManifest = {
    projectName: packageJson.name || 'unknown-project',
    projectRoot,
    framework,
    typescript,
    prisma,
    sourcePaths,
    apiPaths,
    confidence,
    unsupported,
    detectedAt: new Date().toISOString(),
    shepLangVersion: '1.0.0' // TODO: get from package.json
  };

  // Persist manifest to .shep/import-manifest.json
  await persistManifest(projectRoot, manifest);

  return manifest;
}

/**
 * Persist ImportManifest to .shep/import-manifest.json
 */
async function persistManifest(projectRoot: string, manifest: ImportManifest): Promise<void> {
  const shepDir = path.join(projectRoot, '.shep');
  
  // Create .shep directory if it doesn't exist
  if (!fs.existsSync(shepDir)) {
    fs.mkdirSync(shepDir, { recursive: true });
  }
  
  const manifestPath = path.join(shepDir, 'import-manifest.json');
  
  // Write manifest with pretty formatting
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

function detectFramework(
  deps: Record<string, string>,
  projectRoot: string
): FrameworkDetection {
  // Next.js detection
  if ('next' in deps) {
    const version = deps.next;
    const hasAppDir = fs.existsSync(path.join(projectRoot, 'app'));
    const hasPagesDir = fs.existsSync(path.join(projectRoot, 'pages'));
    
    return {
      type: 'nextjs',
      version,
      router: hasAppDir ? 'app' : hasPagesDir ? 'pages' : 'custom',
      confidence: hasAppDir || hasPagesDir ? 0.95 : 0.8
    };
  }

  // Vite detection
  if ('vite' in deps) {
    return {
      type: 'vite',
      version: deps.vite,
      router: 'custom',
      confidence: 0.9
    };
  }

  // React detection
  if ('react' in deps) {
    return {
      type: 'react',
      version: deps.react,
      router: 'custom',
      confidence: 0.8
    };
  }

  // Express detection
  if ('express' in deps || 'fastify' in deps) {
    return {
      type: 'express',
      version: deps.express || deps.fastify,
      router: 'custom',
      confidence: 0.8
    };
  }

  return {
    type: 'unknown',
    confidence: 0.0
  };
}

function detectTypeScript(projectRoot: string) {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const enabled = fs.existsSync(tsconfigPath);
  
  return {
    enabled,
    configPath: enabled ? 'tsconfig.json' : undefined
  };
}

function detectPrisma(projectRoot: string, deps: Record<string, string>) {
  const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
  const hasSchema = fs.existsSync(schemaPath);
  const hasClient = '@prisma/client' in deps || 'prisma' in deps;
  
  return {
    enabled: hasSchema && hasClient,
    schemaPath: hasSchema ? 'prisma/schema.prisma' : undefined,
    clientVersion: deps['@prisma/client'] || deps.prisma
  };
}

function detectSourcePaths(projectRoot: string, framework: FrameworkDetection) {
  const paths: ImportManifest['sourcePaths'] = {};
  
  // Next.js App Router
  if (framework.type === 'nextjs' && framework.router === 'app') {
    paths.app = 'app';
  }
  
  // Next.js Pages Router
  if (framework.type === 'nextjs' && framework.router === 'pages') {
    paths.pages = 'pages';
  }
  
  // Vite/React source
  if (framework.type === 'vite' || framework.type === 'react') {
    if (fs.existsSync(path.join(projectRoot, 'src'))) {
      paths.src = 'src';
    }
  }
  
  // Common components folder
  const componentsPaths = ['src/components', 'components', 'app/components'];
  for (const compPath of componentsPaths) {
    if (fs.existsSync(path.join(projectRoot, compPath))) {
      paths.components = compPath;
      break;
    }
  }
  
  return paths;
}

function detectApiPaths(projectRoot: string, framework: FrameworkDetection) {
  const paths: ImportManifest['apiPaths'] = {};
  
  // Next.js API routes
  if (framework.type === 'nextjs') {
    if (framework.router === 'app') {
      const appApiPath = 'app/api';
      if (fs.existsSync(path.join(projectRoot, appApiPath))) {
        paths.nextjs = appApiPath;
      }
    } else if (framework.router === 'pages') {
      const pagesApiPath = 'pages/api';
      if (fs.existsSync(path.join(projectRoot, pagesApiPath))) {
        paths.nextjs = pagesApiPath;
      }
    }
  }
  
  return paths;
}

function calculateConfidence(
  framework: FrameworkDetection,
  typescript: ImportManifest['typescript'],
  prisma: ImportManifest['prisma']
): ImportManifest['confidence'] {
  const frameworkConf = framework.confidence;
  const tsConf = typescript.enabled ? 0.9 : 0.3;
  const prismaConf = prisma.enabled ? 0.9 : 0.5;
  
  const overall = (frameworkConf + tsConf + prismaConf) / 3;
  
  return {
    framework: frameworkConf,
    typescript: tsConf,
    prisma: prismaConf,
    overall
  };
}

function detectUnsupportedFeatures(
  projectRoot: string,
  deps: Record<string, string>
): string[] {
  const unsupported: string[] = [];
  
  // Monorepo tools
  if (['nx', 'turborepo', 'lerna', 'rush'].some(tool => tool in deps)) {
    unsupported.push('monorepo');
  }
  
  // GraphQL
  if (['@apollo/client', 'graphql', 'urql'].some(lib => lib in deps)) {
    unsupported.push('graphql');
  }
  
  // Server Components (experimental)
  if (fs.existsSync(path.join(projectRoot, '.next')) && 
      fs.existsSync(path.join(projectRoot, 'app'))) {
    // Check for RSC patterns
    const appFiles = fs.readdirSync(path.join(projectRoot, 'app'), { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.tsx'));
    
    for (const file of appFiles) {
      const content = fs.readFileSync(path.join(projectRoot, 'app', file.name), 'utf-8');
      if (content.includes('use client') || content.includes('use server')) {
        unsupported.push('server-components');
        break;
      }
    }
  }
  
  return unsupported;
}
