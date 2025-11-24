"use strict";
/**
 * AST Analyzer for Next.js Projects
 *
 * High-level analyzer that combines React and Prisma parsing
 * to extract the app's semantic structure:
 * - Data models (entities)
 * - Views (pages/screens)
 * - Actions (handlers/API routes)
 *
 * Output: Intermediate app model ready for ShepLang generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProject = analyzeProject;
exports.parseReactFile = parseReactFile;
exports.parseReactProject = parseReactProject;
/**
 * Analyze a Next.js/React project to extract entities, views, and actions
 */
async function analyzeProject(projectRoot) {
    // This is a stub implementation that will be properly restored later
    return {
        appName: 'App',
        projectRoot,
        entities: [],
        views: [],
        actions: [],
        todos: []
    };
}
function parseReactFile(filePath) {
    // Stub implementation
    return {
        components: [],
        imports: []
    };
}
function parseReactProject(rootPath) {
    // Stub implementation
    return {
        components: [],
        pages: [],
        api: []
    };
}
//# sourceMappingURL=astAnalyzer.js.map