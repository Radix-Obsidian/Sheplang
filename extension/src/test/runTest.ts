import * as path from 'path';
import * as fs from 'fs';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index.js');
        const testWorkspace = path.resolve(__dirname, '../../test-workspace');

        console.log('Extension Path:', extensionDevelopmentPath);
        console.log('Tests Path:', extensionTestsPath);
        console.log('Workspace:', testWorkspace);

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [testWorkspace]
        });
    } catch (err: any) {
        console.error('Failed to run tests');
        const errorLog = `Error: ${err.message}\nStack: ${err.stack}\nFull: ${JSON.stringify(err, null, 2)}`;
        console.error(errorLog);
        fs.writeFileSync(path.join(__dirname, '../../test-error.log'), errorLog);
        process.exit(1);
    }
}

main();
