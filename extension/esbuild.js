/**
 * esbuild configuration for ShepLang VS Code Extension
 * 
 * Based on official VS Code documentation:
 * https://code.visualstudio.com/api/working-with-extensions/bundling-extension
 * 
 * This bundles ALL dependencies into a single file so the extension
 * doesn't need node_modules at runtime.
 */

const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[esbuild] Build started...');
    });
    build.onEnd(result => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location) {
          console.error(`    ${location.file}:${location.line}:${location.column}:`);
        }
      });
      if (result.errors.length === 0) {
        console.log('[esbuild] Build completed successfully');
      } else {
        console.log(`[esbuild] Build completed with ${result.errors.length} errors`);
      }
    });
  }
};

async function main() {
  // Build configuration for main extension
  const extensionConfig = {
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: [
      'vscode' // VS Code provides this at runtime
    ],
    logLevel: 'warning',
    plugins: [esbuildProblemMatcherPlugin],
    // Handle the workspace dependency
    alias: {
      '@goldensheepai/sheplang-language': path.resolve(__dirname, '../sheplang/packages/language/src/index.ts')
    },
    // Ensure TypeScript files are handled
    loader: {
      '.ts': 'ts'
    },
    // Target Node.js for VS Code
    target: 'node18',
    // Don't bundle native modules
    packages: 'bundle'
  };

  // Build configuration for language server (separate process)
  const serverConfig = {
    entryPoints: ['src/server/server.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/server.js',
    external: [
      'vscode' // Not used by server but keep consistent
    ],
    logLevel: 'warning',
    plugins: [],
    loader: {
      '.ts': 'ts'
    },
    target: 'node18',
    packages: 'bundle'
  };

  // Build both extension and server
  const ctxExtension = await esbuild.context(extensionConfig);
  const ctxServer = await esbuild.context(serverConfig);

  if (watch) {
    console.log('[esbuild] Watching for changes...');
    await ctxExtension.watch();
    await ctxServer.watch();
  } else {
    await ctxExtension.rebuild();
    await ctxServer.rebuild();
    await ctxExtension.dispose();
    await ctxServer.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
