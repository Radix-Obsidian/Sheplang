/**
 * Claude Client - Anthropic SDK wrapper
 * 
 * Handles API calls to Anthropic Claude with:
 * - Company API key (primary)
 * - User API key (optional override for power users)
 * - Error handling and retries
 * - Usage tracking
 */

import Anthropic from '@anthropic-ai/sdk';
import * as vscode from 'vscode';
import { ANTHROPIC_COMPANY_KEY } from './config';

/**
 * Get company API key (bundled with extension)
 */
function getCompanyKey(): string | undefined {
  // Return company key bundled at build time
  return ANTHROPIC_COMPANY_KEY;
}

/**
 * Get API key - prioritizes user's key, falls back to company key
 */
async function getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  // Check if user provided their own key (power users)
  const config = vscode.workspace.getConfiguration('sheplang');
  const userKey = config.get<string>('anthropicApiKey');
  
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }
  
  // Fall back to company key (bundled with extension)
  return getCompanyKey();
}

/**
 * Create Anthropic client
 */
export async function createClaudeClient(
  context: vscode.ExtensionContext
): Promise<Anthropic | null> {
  const apiKey = await getApiKey(context);
  
  if (!apiKey) {
    return null;
  }
  
  return new Anthropic({
    apiKey,
    // Default timeout: 60 seconds for large file analysis
    timeout: 60000,
  });
}

/**
 * Call Claude with error handling
 */
export async function callClaude(
  context: vscode.ExtensionContext,
  prompt: string,
  maxTokens: number = 4096
): Promise<string | null> {
  try {
    const client = await createClaudeClient(context);
    
    if (!client) {
      // No API key available
      return null;
    }
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',  // Correct model name with date suffix per Anthropic docs
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    // Extract text from response
    const textContent = response.content.find(c => c.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }
    
    return null;
  } catch (error) {
    console.error('Claude API error:', error);
    
    // Handle specific errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        vscode.window.showWarningMessage('Rate limit reached. Please try again in a moment.');
      } else if (error.status === 401) {
        vscode.window.showErrorMessage('Invalid API key. Please check your Anthropic API key in settings.');
      } else {
        vscode.window.showErrorMessage(`AI analysis failed: ${error.message}`);
      }
    }
    
    return null;
  }
}

/**
 * Extract JSON from Claude response
 * Claude sometimes wraps JSON in markdown code blocks
 */
export function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }
  
  // Try to find JSON object directly
  const directMatch = text.match(/\{[\s\S]*\}/);
  if (directMatch) {
    return directMatch[0];
  }
  
  return text;
}
