import fs from 'node:fs/promises';
import path from 'node:path';
import { parseAndMap } from '@sheplang/language';

export async function explainCommand(file: string): Promise<void> {
  const src = await fs.readFile(file, 'utf8');
  const { appModel, diagnostics } = await parseAndMap(src, 'file://' + file);
  if (!appModel || diagnostics.length) {
    console.error('Parse errors:', diagnostics);
    process.exit(1);
  }
  const outDir = path.join('.shep', 'docs');
  await fs.mkdir(outDir, { recursive: true });
  const md = [
    `# ${appModel.name}`,
    ``,
    `## Data`,
    ...appModel.datas.map(d => `- **${d.name}**: ${d.fields.map(f => `${f.name}:${f.type}`).join(', ')}`),
    ``,
    `## Views`,
    ...appModel.views.map(v => `- **${v.name}** (list: ${v.list ?? '-'})`),
    ``,
    `## Actions`,
    ...appModel.actions.map(a => `- **${a.name}**(${(a.params??[]).map(p=>p.name).join(', ')})`)
  ].join('\n');
  const outPath = path.join(outDir, `${appModel.name}.md`);
  await fs.writeFile(outPath, md, 'utf8');
  console.log('Docs:', outPath);
}
