export interface BobaOutput {
    code: string;
    canonicalAst: any;
}
/**
 * Transpiles ShepLang source to BobaScript
 */
export declare function transpileShepToBoba(source: string): BobaOutput;
