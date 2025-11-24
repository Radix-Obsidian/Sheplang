"use strict";
/**
 * React/TypeScript Parser for Next.js Projects
 *
 * Parses React/TypeScript files to extract:
 * - Components and their structure
 * - JSX elements (buttons, forms, lists)
 * - Props and state
 * - Event handlers
 * - API calls
 *
 * Used by Next.js importer to convert projects to ShepLang.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReactFile = parseReactFile;
exports.parseReactProject = parseReactProject;
exports.findApiCalls = findApiCalls;
exports.findFormSubmissions = findFormSubmissions;
/**
 * Parse a React file to extract component information
 */
function parseReactFile(filePath) {
    // This is a stub implementation that will be properly restored later
    return null;
}
/**
 * Parse a React project to extract all components
 */
function parseReactProject(projectRoot) {
    // This is a stub implementation that will be properly restored later
    return [];
}
/**
 * Find API calls in a React component
 */
function findApiCalls(component) {
    return component.apiCalls || [];
}
/**
 * Find form submissions in a React component
 */
function findFormSubmissions(component) {
    return [];
}
//# sourceMappingURL=reactParser.js.map