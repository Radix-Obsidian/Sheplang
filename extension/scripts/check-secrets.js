#!/usr/bin/env node
/**
 * Pre-commit secret scanner
 * Prevents accidental commit of API keys
 */

const fs = require('fs');
const path = require('path');

const PATTERNS = [
  /sk-ant-api[a-zA-Z0-9_-]{50,}/g,  // Anthropic API keys
  /sk-[a-zA-Z0-9]{48}/g,             // OpenAI API keys
  /AIza[a-zA-Z0-9_-]{35}/g,          // Google API keys
  /ghp_[a-zA-Z0-9]{36}/g,            // GitHub personal access tokens
  /gho_[a-zA-Z0-9]{36}/g,            // GitHub OAuth tokens
];

const EXCLUDED_FILES = [
  '.git',
  'node_modules',
  'dist',
  'out',
  '.vsix',
  'check-secrets.js', // This file contains patterns
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  for (const pattern of PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file: filePath,
        pattern: pattern.source,
        matches: matches.map(m => m.substring(0, 20) + '...'),
      });
    }
  }
  
  return issues;
}

function scanDirectory(dir) {
  const issues = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip excluded paths
    if (EXCLUDED_FILES.some(ex => entry.name.includes(ex))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      issues.push(...scanDirectory(fullPath));
    } else if (entry.isFile()) {
      // Only scan text files
      const ext = path.extname(entry.name).toLowerCase();
      const textExtensions = ['.js', '.ts', '.json', '.md', '.txt', '.env', '.example', '.yaml', '.yml'];
      if (textExtensions.includes(ext) || entry.name.startsWith('.env')) {
        issues.push(...scanFile(fullPath));
      }
    }
  }
  
  return issues;
}

// Main
console.log('🔍 Scanning for exposed secrets...\n');

const extensionDir = path.join(__dirname, '..');
const issues = scanDirectory(extensionDir);

if (issues.length > 0) {
  console.error('❌ SECRETS DETECTED!\n');
  for (const issue of issues) {
    console.error(`File: ${issue.file}`);
    console.error(`Pattern: ${issue.pattern}`);
    console.error(`Found: ${issue.matches.join(', ')}`);
    console.error('');
  }
  console.error('⚠️  Remove these secrets before committing!');
  console.error('   Real keys should ONLY be in .env (gitignored)');
  process.exit(1);
} else {
  console.log('✅ No secrets detected. Safe to commit.');
  process.exit(0);
}
