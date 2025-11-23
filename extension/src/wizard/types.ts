/**
 * ShepLang Project Wizard - Type Definitions
 * 
 * Defines the structure for the questionnaire and generated project
 */

export type ProjectType = 
  | 'mobile-first'
  | 'saas-dashboard'
  | 'ecommerce'
  | 'content-platform'
  | 'custom';

export type UserRoleType =
  | 'single-user'
  | 'multiple-roles'
  | 'team-based';

export interface ProjectFeature {
  name: string;
  description?: string;
}

export interface EntityField {
  name: string;
  type: 'text' | 'number' | 'date' | 'yes/no' | 'image' | 'ref';
  required?: boolean;
  unique?: boolean;
  refEntity?: string;
  isArray?: boolean;
  validation?: string;
}

export interface EntityDefinition {
  name: string;
  fields: EntityField[];
  states?: string[];
  relationships?: EntityRelationship[];
}

export interface EntityRelationship {
  type: 'belongsTo' | 'hasMany' | 'hasOne';
  entity: string;
  field: string;
}

export interface UserRole {
  name: string;
  permissions: string[];
}

export interface Integration {
  category: 'payments' | 'email' | 'storage' | 'analytics' | 'auth' | 'custom';
  service: string;
  features?: string[];
}

export interface ProjectQuestionnaire {
  // Step 1: Project Overview
  projectType: ProjectType;
  projectName: string;
  description?: string;
  customDescription?: string;
  
  // Step 2: Core Features
  features: ProjectFeature[];
  
  // Step 3: Data Model
  entities: EntityDefinition[];
  
  // Step 4: User Roles
  roleType: UserRoleType;
  roles?: UserRole[];
  
  // Step 5: Integrations
  integrations: Integration[];
  
  // Step 6: Technical Preferences
  apiStyle?: 'REST' | 'GraphQL';
  realtime?: boolean;
  deployment?: 'Vercel' | 'AWS' | 'Docker' | 'Other';
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface FolderStructure {
  path: string;
  type: 'folder' | 'file';
  content?: string;
  description?: string;
}

export interface GenerationProgress {
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  currentAction: string;
  logs: string[];
  errors: string[];
}

export interface ProjectStructure {
  root: string;
  folders: FolderStructure[];
  files: Map<string, string>;
  readme: string;
  nextSteps: string;
}
