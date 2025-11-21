/**
 * Wizard Interpreter - AI-powered input understanding
 * 
 * Uses Claude to interpret natural language wizard answers
 * Provides confidence and transparency to users
 */

import * as vscode from 'vscode';
import { callClaude, extractJSON } from './claudeClient';

export interface EntityInterpretation {
  hasEntities: boolean;
  entities: string[] | null;
  reasoning: string;
}

export interface InstructionInterpretation {
  hasInstructions: boolean;
  instructions: string | null;
  reasoning: string;
}

/**
 * Interpret entity input from wizard
 */
export async function interpretEntityInput(
  context: vscode.ExtensionContext,
  userInput: string,
  projectContext: string
): Promise<EntityInterpretation | null> {
  const prompt = `
You are helping interpret a user's answer to a wizard question about their app.

Question asked: "What are the main things or concepts in your app?"

User's answer: "${userInput}"

Project context: ${projectContext}

Analyze this answer and determine:
1. Is the user describing actual data entities/concepts that should be tracked in a database? (Yes/No)
2. If yes, extract clean entity names as an array (e.g., ["User", "Product", "Order"])
3. If no, explain why in plain English (e.g., "This is a UI component, not a data management app")

Important:
- Be generous: If it's ambiguous, assume they mean entities
- Single words or short phrases only (not full sentences)
- Capitalize entity names (PascalCase)
- Common indicators of "no entities": mentions of "component", "UI", "doesn't track", "just a [thing]"

Return ONLY valid JSON in this exact format:
{
  "hasEntities": boolean,
  "entities": ["EntityName1", "EntityName2"] or null,
  "reasoning": "brief explanation of interpretation"
}
`;

  const response = await callClaude(context, prompt, 1024);
  
  if (!response) {
    return null; // Fallback to heuristics if AI unavailable
  }
  
  try {
    const json = extractJSON(response);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse entity interpretation:', error);
    return null;
  }
}

/**
 * Interpret custom instructions from wizard
 */
export async function interpretInstructions(
  context: vscode.ExtensionContext,
  userInput: string
): Promise<InstructionInterpretation | null> {
  const prompt = `
You are helping interpret special instructions from a user.

Question asked: "Any special instructions for code generation?"

User's answer: "${userInput}"

Analyze this and determine:
1. Did the user provide meaningful instructions? (not just "no", "none", "n/a")
2. If yes, clean up the instructions to be concise and actionable
3. If no, explain why (e.g., "User indicated no special requirements")

Return ONLY valid JSON in this exact format:
{
  "hasInstructions": boolean,
  "instructions": "cleaned up instruction text" or null,
  "reasoning": "brief explanation"
}
`;

  const response = await callClaude(context, prompt, 512);
  
  if (!response) {
    return null;
  }
  
  try {
    const json = extractJSON(response);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse instruction interpretation:', error);
    return null;
  }
}

/**
 * Show interpretation feedback to user
 */
export function showEntityFeedback(interpretation: EntityInterpretation): void {
  if (interpretation.hasEntities && interpretation.entities) {
    const entityList = interpretation.entities.map(e => `• ${e}`).join('\n');
    vscode.window.showInformationMessage(
      `✓ Got it! Main concepts:\n${entityList}\n\n(AI understood: ${interpretation.reasoning})`,
      { modal: false }
    );
  } else {
    vscode.window.showInformationMessage(
      `✓ Understood: ${interpretation.reasoning}`,
      { modal: false }
    );
  }
}

/**
 * Show instruction feedback to user
 */
export function showInstructionFeedback(interpretation: InstructionInterpretation): void {
  if (interpretation.hasInstructions && interpretation.instructions) {
    vscode.window.showInformationMessage(
      `✓ Got it! I'll add this note:\n"${interpretation.instructions}"\n\n(AI understood: ${interpretation.reasoning})`,
      { modal: false }
    );
  }
}
