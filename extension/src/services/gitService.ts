import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';

export class GitService {
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    /**
     * Clones a repository to the specified target path.
     * @param repoUrl The URL of the Git repository to clone.
     * @param targetPath The local path where the repository should be cloned.
     */
    async cloneRepo(repoUrl: string, targetPath: string): Promise<void> {
        try {
            // Ensure parent directory exists
            const parentDir = path.dirname(targetPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }

            // Check if target directory already exists and is not empty
            if (fs.existsSync(targetPath) && fs.readdirSync(targetPath).length > 0) {
                throw new Error(`Target directory '${targetPath}' already exists and is not empty.`);
            }

            await this.git.clone(repoUrl, targetPath);
        } catch (error: any) {
            throw new Error(`Failed to clone repository: ${error.message}`);
        }
    }

    /**
     * Checks if Git is installed and available in the system path.
     */
    async isGitInstalled(): Promise<boolean> {
        try {
            await this.git.version();
            return true;
        } catch (error) {
            return false;
        }
    }
}
