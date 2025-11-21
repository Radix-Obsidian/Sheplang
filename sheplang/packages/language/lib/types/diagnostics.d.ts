/**
 * Unified diagnostic interface for ShepLang tooling
 */
export interface Diagnostic {
    message: string;
    severity: 'error' | 'warning' | 'info';
    start: {
        line: number;
        column: number;
        offset: number;
    };
    end?: {
        line: number;
        column: number;
        offset: number;
    };
    code?: string;
    source?: string;
}
/**
 * Common compilation result interface for all tools
 */
export interface CompilationResult<T> {
    output: T | null;
    diagnostics: Diagnostic[];
    success: boolean;
}
