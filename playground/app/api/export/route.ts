import { NextRequest, NextResponse } from 'next/server';

/**
 * ShepLang Project Export API Endpoint
 * 
 * Generates a ZIP file containing a complete ShepLang project
 * POST /api/export
 * 
 * Request body:
 * {
 *   code: string
 *   appName?: string
 * }
 * 
 * Response: ZIP file download
 */

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid Turbopack build issues
    const JSZip = (await import('jszip')).default;
    
    const body = await request.json();
    const { code, appName = 'ShepLangProject' } = body;
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: code is required' },
        { status: 400 }
      );
    }

    // Extract app name from code if available
    const appMatch = code.match(/^\s*app\s+(\w+)/m);
    const projectName = appMatch ? appMatch[1] : appName;
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Add main ShepLang source file
    zip.file(`${projectName}.shep`, code);
    
    // Add package.json
    const packageJson = {
      name: projectName.toLowerCase(),
      version: '1.0.0',
      description: `ShepLang application: ${projectName}`,
      main: 'index.js',
      scripts: {
        dev: 'sheplang dev',
        build: 'sheplang build',
        start: 'sheplang start'
      },
      dependencies: {
        '@goldensheepai/sheplang-language': '^1.0.0',
        '@goldensheepai/sheplang-runtime': '^1.0.0'
      },
      devDependencies: {
        '@goldensheepai/sheplang-cli': '^1.0.0'
      },
      keywords: ['sheplang', 'ai-native', 'full-stack'],
      author: '',
      license: 'MIT'
    };
    
    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    
    // Add README.md
    const readme = `# ${projectName}

A ShepLang application created in the ShepLang Playground.

## What is ShepLang?

ShepLang is an AI-native programming language designed for building full-stack applications with minimal code.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- VS Code with ShepLang extension (recommended)

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Development with VS Code

For the best experience:

1. Install the ShepLang VS Code extension
2. Open this folder in VS Code
3. Open \`${projectName}.shep\` to edit your application
4. Use the extension's preview and validation features

## Project Structure

- \`${projectName}.shep\` - Your ShepLang application code
- \`package.json\` - Project dependencies and scripts
- \`README.md\` - This file

## Learn More

- [ShepLang Documentation](https://github.com/Radix-Obsidian/Sheplang)
- [ShepLang Playground](http://localhost:3000) - Try ShepLang in your browser
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=goldensheepai.sheplang)

## Next Steps

1. Open this project in VS Code with the ShepLang extension
2. Edit \`${projectName}.shep\` to modify your application
3. Run \`npm run dev\` to see your changes live
4. When ready, run \`npm run build\` to create a production build

## Support

For questions and support:
- GitHub Issues: https://github.com/Radix-Obsidian/Sheplang/issues
- Documentation: https://github.com/Radix-Obsidian/Sheplang/wiki

---

Built with ❤️ using ShepLang - The AI-Native Programming Language
`;
    
    zip.file('README.md', readme);
    
    // Add .gitignore
    const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# ShepLang
.sheplang/
`;
    
    zip.file('.gitignore', gitignore);
    
    // Generate ZIP
    const zipBlob = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    // Return ZIP file as Uint8Array for proper typing
    const zipUint8 = new Uint8Array(zipBlob);
    
    return new NextResponse(zipUint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName}.zip"`,
        'Content-Length': zipBlob.length.toString()
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Export error:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export project',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// GET handler for API info
export async function GET() {
  return NextResponse.json({
    status: 'ShepLang Export API',
    version: '1.0.0',
    endpoints: {
      export: 'POST /api/export'
    }
  });
}
