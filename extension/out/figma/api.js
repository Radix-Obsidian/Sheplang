"use strict";
/**
 * Figma REST API Client
 *
 * Official Documentation:
 * - REST API: https://developers.figma.com/docs/rest-api/
 * - Authentication: https://developers.figma.com/docs/rest-api/authentication/
 * - Get Files: https://developers.figma.com/docs/rest-api/files/get-file/
 *
 * This client uses the Figma REST API with Personal Access Tokens.
 * No plugin required - standard HTTP requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaAPIClient = void 0;
/**
 * Figma REST API Client
 *
 * Usage:
 * ```typescript
 * const client = new FigmaAPIClient({ accessToken: 'figd_...' });
 * const file = await client.getFile('abc123');
 * ```
 */
class FigmaAPIClient {
    config;
    baseUrl = 'https://api.figma.com/v1';
    constructor(config) {
        this.config = config;
        if (!config.accessToken) {
            throw new Error('Figma access token is required');
        }
    }
    /**
     * Get file data from Figma
     *
     * Official docs: https://developers.figma.com/docs/rest-api/files/get-file/
     * Rate limits: https://developers.figma.com/docs/rest-api/rate-limits/
     *
     * Implements automatic retry with Retry-After header per Figma's official guidance.
     *
     * @param fileId - The Figma file ID (from URL: figma.com/file/{fileId}/...)
     * @returns Complete file data including document tree
     */
    async getFile(fileId) {
        const url = `${this.baseUrl}/files/${fileId}`;
        const maxRetries = 3;
        let attempts = 0;
        while (attempts < maxRetries) {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Figma-Token': this.config.accessToken,
                },
            });
            // Success!
            if (response.ok) {
                return response.json();
            }
            // Rate limited - implement official retry pattern
            if (response.status === 429) {
                attempts++;
                // Get official retry delay from header
                const retryAfterHeader = response.headers.get('retry-after');
                const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
                // Get additional rate limit info from headers
                const planTier = response.headers.get('x-figma-plan-tier');
                const rateLimitType = response.headers.get('x-figma-rate-limit-type');
                if (attempts >= maxRetries) {
                    throw new Error(`Figma rate limit exceeded after ${maxRetries} attempts. ` +
                        `Plan: ${planTier}, Type: ${rateLimitType}. ` +
                        `Please wait ${retryAfter} seconds before trying again.`);
                }
                // Wait for the official retry period
                console.log(`[Figma API] Rate limited. Waiting ${retryAfter}s before retry ${attempts}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            // Other error
            const error = await response.text();
            throw new Error(`Figma API error (${response.status}): ${error}`);
        }
        throw new Error('Max retries exceeded for Figma API');
    }
    /**
     * Extract file ID from Figma URL or return as-is if already an ID
     *
     * Supports ALL Figma link formats:
     * - Standard file link: https://www.figma.com/file/abc123/My-Design
     * - Dev Mode link: https://www.figma.com/file/abc123/My-Design?type=dev
     * - Prototype link: https://www.figma.com/proto/abc123/My-Design
     * - Design link: https://www.figma.com/design/abc123/My-Design
     * - Raw ID: abc123
     *
     * @param urlOrId - Figma URL or file ID
     * @returns File ID
     */
    static extractFileId(urlOrId) {
        // If it contains "figma.com", extract ID from URL
        if (urlOrId.includes('figma.com')) {
            // Match any of these patterns:
            // /file/[id]/, /proto/[id]/, /design/[id]/
            const match = urlOrId.match(/\/(file|proto|design)\/([a-zA-Z0-9]+)/);
            return match ? match[2] : null;
        }
        // Otherwise assume it's already an ID
        // Figma file IDs are alphanumeric, typically 22 characters
        if (/^[a-zA-Z0-9]+$/.test(urlOrId)) {
            return urlOrId;
        }
        return null;
    }
}
exports.FigmaAPIClient = FigmaAPIClient;
//# sourceMappingURL=api.js.map