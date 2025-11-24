import { NextRequest, NextResponse } from 'next/server';
import { generateApp } from '@goldensheepai/sheplang-compiler';

/**
 * ShepLang Authentic Code Generation API
 * 
 * Uses the real ShepLang compiler to generate production-ready code
 * POST /api/generate
 * 
 * Request body:
 * {
 *   code: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   files: Record<string, string>
 *   entryPoint: string
 *   diagnostics: Diagnostic[]
 *   metrics: {
 *     totalFiles: number
 *     totalLines: number
 *     components: number
 *     apiRoutes: number
 *     models: number
 *     generationTime: number
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code is required and must be a string',
          diagnostics: []
        },
        { status: 400 }
      );
    }
    
    // Use the real compiler
    console.log('[Generate API] Compiling ShepLang code...');
    const result = await generateApp(code);
    
    const generationTime = Date.now() - startTime;
    console.log(`[Generate API] Compilation ${result.success ? 'succeeded' : 'failed'} in ${generationTime}ms`);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Compilation failed',
          diagnostics: result.diagnostics || [],
        },
        { status: 400 }
      );
    }
    
    // Calculate metrics
    const files = result.output!.files;
    const fileKeys = Object.keys(files);
    
    const totalFiles = fileKeys.length;
    const totalLines = fileKeys.reduce((sum, key) => {
      return sum + (files[key].split('\n').length || 0);
    }, 0);
    
    // Count specific file types
    const components = fileKeys.filter(f => f.startsWith('screens/')).length;
    const apiRoutes = fileKeys.filter(f => f.startsWith('api/routes/')).length;
    const models = fileKeys.filter(f => f.startsWith('models/')).length;
    const hooks = fileKeys.filter(f => f.startsWith('hooks/')).length;
    const validation = fileKeys.filter(f => f.startsWith('validation/')).length;
    
    console.log('[Generate API] Metrics:', {
      totalFiles,
      totalLines,
      components,
      apiRoutes,
      models,
      hooks,
      validation
    });
    
    return NextResponse.json(
      {
        success: true,
        files: result.output!.files,
        entryPoint: result.output!.entryPoint,
        diagnostics: result.diagnostics || [],
        metrics: {
          totalFiles,
          totalLines,
          components,
          apiRoutes,
          models,
          hooks,
          validation,
          generationTime
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error during code generation';
    console.error('[Generate API] Unexpected error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        diagnostics: []
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ShepLang Authentic Code Generation API',
    version: '1.0.0',
    description: 'Uses the real ShepLang compiler to generate production-ready code',
    endpoints: {
      generate: 'POST /api/generate'
    }
  });
}
