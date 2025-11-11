import { execa } from 'execa';

export async function formatCommand(): Promise<void> {
  await execa('npx', ['prettier','-w','**/*.{ts,js,md,json}'], { stdio:'inherit' });
}
