/**
 * AI Module Exports
 * Central export point for all AI-related functionality
 */

// Claude API Client
export { callClaude, createClaudeClient, extractJSON } from './claudeClient';

// ShepLang Code Generation Agent (NEW!)
export { ShepLangCodeAgent, ComponentSpec, EntitySpec } from './sheplangCodeAgent';

// Training Data
export { SHEPLANG_TRAINING_EXAMPLES, ShepLangExamples } from './training/sheplangExamples';

// Project Generation
export { generateProjectFromPrompt } from './projectGenerator';

// Usage Tracking (only export what exists)
export { showUsageStats, resetUsageForTesting } from './usageTracker';
