import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalysis } from './analyzer';

export class ScaffoldGenerator {
    async generate(analysis: ProjectAnalysis, targetPath: string): Promise<void> {
        const appDir = path.join(targetPath, 'app');
        const entitiesDir = path.join(appDir, 'entities');
        const screensDir = path.join(appDir, 'screens');
        const flowsDir = path.join(appDir, 'flows');

        // Create directories
        [entitiesDir, screensDir, flowsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Generate Entities
        analysis.entities.forEach(entity => {
            const content = `data ${entity} {
  // TODO: Define fields for ${entity}
  // This entity was imported from existing code
  name: text
}
`;
            fs.writeFileSync(path.join(entitiesDir, `${entity}.shep`), content);
        });

        // Generate Screens (from pages)
        analysis.pages.forEach(page => {
            // Convert path to screen name (e.g., "dashboard/settings.tsx" -> "DashboardSettings")
            const screenName = this.pathToName(page);
            const content = `view ${screenName} {
  // Imported from ${page}
  text "Page: ${screenName}"
}
`;
            fs.writeFileSync(path.join(screensDir, `${screenName}.shep`), content);
        });

        // Generate Project Brief
        this.generateProjectBrief(analysis, targetPath);
    }

    private pathToName(filePath: string): string {
        const parsed = path.parse(filePath);
        const parts = parsed.dir.split(path.sep).filter(p => p !== '.' && p !== '');
        parts.push(parsed.name);

        // Remove 'index', 'page', 'route' from name parts if they are not the only part
        const cleanParts = parts.filter(p => !['index', 'page', 'route'].includes(p.toLowerCase()));
        if (cleanParts.length === 0) return 'Home';

        return cleanParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    }

    private generateProjectBrief(analysis: ProjectAnalysis, targetPath: string) {
        const briefPath = path.join(targetPath, '.specify', 'wizard');
        if (!fs.existsSync(briefPath)) {
            fs.mkdirSync(briefPath, { recursive: true });
        }

        const content = `# Project Brief (Imported)

## Overview
Imported project detected as: **${analysis.framework}**
- **Pages detected**: ${analysis.pages.length}
- **API Routes detected**: ${analysis.apiRoutes.length}
- **Entities detected**: ${analysis.entities.length}
${analysis.hasPrisma ? '- **Prisma detected**: Yes' : ''}

## Entities
${analysis.entities.map(e => `- ${e}`).join('\n')}

## Screens
${analysis.pages.map(p => `- ${this.pathToName(p)} (${p})`).join('\n')}

## Notes
This project was imported via ShepLang Git Import.
`;
        fs.writeFileSync(path.join(briefPath, 'project-brief.md'), content);
    }
}
