/**
 * AI Suggestion Service for Project Wizard
 * 
 * Analyzes user responses and provides intelligent project suggestions
 * - Project structure recommendations
 * - Feature suggestions based on project type
 * - Entity and field recommendations
 * - Best practices and design patterns
 */

import * as vscode from 'vscode';
import { callClaude } from './claudeClient';

// Local definition of ProjectQuestionnaire (from deleted wizard/types.ts)
export interface ProjectQuestionnaire {
  projectName?: string;
  projectType?: string;
  description?: string;
  entities?: any[]; // Changed from string[] to any[] to support complex entity objects
  features?: Array<{ name: string; description?: string }>;
  integrations?: Array<{ service: string; category: string }>; // Added to fix integration suggestion
}

export interface ProjectSuggestion {
  type: 'entity' | 'feature' | 'integration' | 'design' | 'flow';
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-1
  autoApply: boolean;
  data?: any;
}

export interface SuggestionContext {
  projectName: string;
  projectType: string;
  description?: string;
  features?: Array<{ name: string; description?: string }>;
  entities?: Array<{ name: string; fields: any[] }>;
}

/**
 * Generate AI suggestions based on user responses
 */
export async function generateSuggestions(
  context: vscode.ExtensionContext,
  suggestionContext: SuggestionContext
): Promise<ProjectSuggestion[]> {
  const prompt = buildSuggestionPrompt(suggestionContext);
  
  try {
    const response = await callClaude(context, prompt, 2000);
    
    if (!response) {
      return getFallbackSuggestions(suggestionContext);
    }
    
    const suggestions = parseSuggestions(response);
    return suggestions.length > 0 ? suggestions : getFallbackSuggestions(suggestionContext);
    
  } catch (error) {
    console.error('AI suggestion generation failed:', error);
    return getFallbackSuggestions(suggestionContext);
  }
}

/**
 * Build prompt for AI suggestion generation
 */
function buildSuggestionPrompt(context: SuggestionContext): string {
  return `You are an expert software architect helping a user design their application in ShepLang.

Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description || 'Not provided'}
- Features so far: ${context.features?.map(f => f.name).join(', ') || 'None yet'}
- Entities defined: ${context.entities?.map(e => e.name).join(', ') || 'None yet'}

Based on this project type and context, suggest 3-5 practical recommendations that would improve this project.
Consider:
1. Additional entities/data models that would be valuable
2. Features commonly needed for this project type
3. Integrations that make sense (payments, auth, email, etc.)
4. Design patterns and workflows
5. User flows and screens

Return your suggestions as a JSON array with this structure:
[
  {
    "type": "entity|feature|integration|design|flow",
    "title": "Short title",
    "description": "What this adds to the project",
    "reasoning": "Why this is valuable for their project type",
    "confidence": 0.8,
    "autoApply": false,
    "data": { /* relevant data for applying the suggestion */ }
  }
]

Focus on practical, concrete suggestions that a founder building a ${context.projectType} would actually need.
Be specific and actionable. Return ONLY the JSON array, no other text.`;
}

/**
 * Parse AI response into suggestions
 */
function parseSuggestions(response: string): ProjectSuggestion[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const suggestions = JSON.parse(jsonText);
    
    if (!Array.isArray(suggestions)) {
      console.error('AI response was not an array');
      return [];
    }
    
    // Validate and filter suggestions
    return suggestions
      .filter(s => s.type && s.title && s.description)
      .map(s => ({
        type: s.type,
        title: s.title,
        description: s.description,
        reasoning: s.reasoning || '',
        confidence: Math.min(Math.max(s.confidence || 0.5, 0), 1),
        autoApply: s.autoApply === true,
        data: s.data || {}
      }));
      
  } catch (error) {
    console.error('Failed to parse AI suggestions:', error);
    return [];
  }
}

/**
 * Fallback suggestions when AI is unavailable
 */
function getFallbackSuggestions(context: SuggestionContext): ProjectSuggestion[] {
  const suggestions: ProjectSuggestion[] = [];
  
  // Type-specific suggestions
  switch (context.projectType) {
    case 'saas-dashboard':
      suggestions.push(
        {
          type: 'entity',
          title: 'Add Organization Entity',
          description: 'Track customer organizations for team-based access',
          reasoning: 'SaaS apps typically need multi-tenant organization support',
          confidence: 0.9,
          autoApply: false,
          data: {
            name: 'Organization',
            fields: [
              { name: 'name', type: 'text', required: true },
              { name: 'plan', type: 'text', required: true },
              { name: 'maxUsers', type: 'number', required: false }
            ]
          }
        },
        {
          type: 'integration',
          title: 'Add Stripe Integration',
          description: 'Handle subscription payments and billing',
          reasoning: 'SaaS products need payment processing for subscriptions',
          confidence: 0.85,
          autoApply: false,
          data: { service: 'Stripe', category: 'Payment' }
        }
      );
      break;
      
    case 'ecommerce':
      suggestions.push(
        {
          type: 'entity',
          title: 'Add Order Entity',
          description: 'Track customer orders and fulfillment',
          reasoning: 'E-commerce stores need robust order management',
          confidence: 0.95,
          autoApply: false,
          data: {
            name: 'Order',
            fields: [
              { name: 'orderNumber', type: 'text', required: true },
              { name: 'total', type: 'number', required: true },
              { name: 'status', type: 'text', required: true }
            ]
          }
        },
        {
          type: 'integration',
          title: 'Add Payment Gateway',
          description: 'Process customer payments securely',
          reasoning: 'Online stores require payment processing',
          confidence: 0.9,
          autoApply: false,
          data: { service: 'Stripe', category: 'Payment' }
        }
      );
      break;
      
    case 'mobile-first':
      suggestions.push(
        {
          type: 'feature',
          title: 'Add Push Notifications',
          description: 'Engage users with timely mobile notifications',
          reasoning: 'Mobile apps benefit greatly from push notification engagement',
          confidence: 0.8,
          autoApply: false,
          data: { name: 'Push Notifications', description: 'User engagement via mobile push' }
        }
      );
      break;
  }
  
  // Universal suggestions
  if (!context.entities?.some(e => e.name === 'User')) {
    suggestions.push({
      type: 'entity',
      title: 'Add User Entity',
      description: 'Core user authentication and profile management',
      reasoning: 'Most applications need user accounts',
      confidence: 0.95,
      autoApply: false,
      data: {
        name: 'User',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'text', required: true },
          { name: 'createdAt', type: 'date', required: false }
        ]
      }
    });
  }
  
  suggestions.push({
    type: 'flow',
    title: 'Add Authentication Flow',
    description: 'User login, registration, and password reset',
    reasoning: 'Authentication is essential for user-based applications',
    confidence: 0.9,
    autoApply: false,
    data: { name: 'Authentication', steps: ['register', 'login', 'reset-password'] }
  });
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

/**
 * Apply a suggestion to the questionnaire
 */
export function applySuggestion(
  questionnaire: ProjectQuestionnaire,
  suggestion: ProjectSuggestion
): ProjectQuestionnaire {
  const updated = { ...questionnaire };
  
  switch (suggestion.type) {
    case 'entity':
      if (suggestion.data && suggestion.data.name) {
        updated.entities = updated.entities || [];
        // Check if entity already exists
        if (!updated.entities.some(e => e.name === suggestion.data.name)) {
          updated.entities.push({
            name: suggestion.data.name,
            fields: suggestion.data.fields || []
          });
        }
      }
      break;
      
    case 'feature':
      if (suggestion.data && suggestion.data.name) {
        updated.features = updated.features || [];
        // Check if feature already exists
        if (!updated.features.some(f => f.name === suggestion.data.name)) {
          updated.features.push({
            name: suggestion.data.name,
            description: suggestion.data.description || suggestion.description
          });
        }
      }
      break;
      
    case 'integration':
      if (suggestion.data && suggestion.data.service) {
        updated.integrations = updated.integrations || [];
        // Check if integration already exists
        if (!updated.integrations.some(i => i.service === suggestion.data.service)) {
          updated.integrations.push({
            service: suggestion.data.service,
            category: suggestion.data.category || 'Other'
          });
        }
      }
      break;
      
    case 'flow':
      // Flow suggestions are more complex, just add to features for now
      if (suggestion.data && suggestion.data.name) {
        updated.features = updated.features || [];
        if (!updated.features.some(f => f.name === suggestion.data.name)) {
          updated.features.push({
            name: suggestion.data.name,
            description: suggestion.description
          });
        }
      }
      break;
  }
  
  return updated;
}
