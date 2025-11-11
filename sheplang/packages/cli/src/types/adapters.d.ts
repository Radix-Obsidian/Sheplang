declare module '@adapters/sheplang-to-boba' {
  export interface BobaOutput {
    code: string;
    canonicalAst: any;
  }
  
  export function transpileShepToBoba(source: string): BobaOutput;
}
