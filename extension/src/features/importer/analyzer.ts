import * as fs from 'fs';
import * as path from 'path';

export interface ProjectAnalysis {
    framework: 'nextjs' | 'react' | 'unknown';
    pages: string[];
    apiRoutes: string[];
    entities: string[];
    hasPrisma: boolean;
}

export class ProjectAnalyzer {
    async analyze(projectPath: string): Promise<ProjectAnalysis> {
        const analysis: ProjectAnalysis = {
            framework: 'unknown',
            pages: [],
            apiRoutes: [],
            entities: [],
            hasPrisma: false
        };

        // 1. Detect Framework
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (dependencies['next']) {
                    analysis.framework = 'nextjs';
                } else if (dependencies['react']) {
                    analysis.framework = 'react';
                }
            } catch (e) {
                console.error('Failed to parse package.json', e);
            }
        }

        // 2. Detect Pages & API Routes
        if (analysis.framework === 'nextjs') {
            this.scanNextJsRoutes(projectPath, analysis);
        }

        // 3. Detect Entities
        this.detectEntities(projectPath, analysis);

        return analysis;
    }

    private scanNextJsRoutes(projectPath: string, analysis: ProjectAnalysis) {
        const pagesDir = path.join(projectPath, 'pages');
        const appDir = path.join(projectPath, 'app');

        // Scan /pages
        if (fs.existsSync(pagesDir)) {
            this.scanDir(pagesDir, (filePath) => {
                const relative = path.relative(pagesDir, filePath);
                if (relative.startsWith('api' + path.sep)) {
                    analysis.apiRoutes.push(relative);
                } else {
                    analysis.pages.push(relative);
                }
            });
        }

        // Scan /app (App Router)
        if (fs.existsSync(appDir)) {
            this.scanDir(appDir, (filePath) => {
                // App router structure is different, but for now just capturing files
                const relative = path.relative(appDir, filePath);
                if (relative.includes('route.ts') || relative.includes('route.js')) {
                    analysis.apiRoutes.push(relative);
                } else if (relative.includes('page.tsx') || relative.includes('page.jsx')) {
                    analysis.pages.push(relative);
                }
            });
        }
    }

    private detectEntities(projectPath: string, analysis: ProjectAnalysis) {
        // Check for Prisma
        const prismaPath = path.join(projectPath, 'prisma', 'schema.prisma');
        if (fs.existsSync(prismaPath)) {
            analysis.hasPrisma = true;
            // TODO: Parse Prisma schema for precise entities
            // For now, just mark it.
        }

        // Heuristic: Look for models/ or entities/ folders
        const possibleDirs = ['models', 'entities', 'types', 'lib/types'];
        for (const dir of possibleDirs) {
            const fullPath = path.join(projectPath, dir);
            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath).filter(f => !f.startsWith('.'));
                files.forEach(f => {
                    const name = path.parse(f).name;
                    // Simple heuristic: Capitalized names are likely entities
                    if (/^[A-Z]/.test(name)) {
                        analysis.entities.push(name);
                    }
                });
            }
        }
    }

    private scanDir(dir: string, callback: (filePath: string) => void) {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.scanDir(fullPath, callback);
            } else {
                callback(fullPath);
            }
        }
    }
}
