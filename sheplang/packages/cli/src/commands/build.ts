import fs from 'node:fs/promises';
import { parseAndMap } from '@sheplang/language';
import { transpileToTS } from '@sheplang/transpiler';

export async function buildCommand(file: string): Promise<void> {
  const contents = await fs.readFile(file, 'utf8');
  const { appModel, diagnostics } = await parseAndMap(contents, 'file://' + file);
  if (!appModel || diagnostics.length) {
    console.error('Parse errors:', diagnostics);
    process.exit(1);
  }
  const out = await transpileToTS(appModel);
  console.log('Built:', out.outDir);
}
