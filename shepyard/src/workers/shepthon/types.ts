/**
 * Shared types for ShepThon Web Worker
 * 
 * These types are used by both the worker and main thread.
 */

export interface AppMetadata {
  name: string;
  models: ModelInfo[];
  endpoints: EndpointInfo[];
  jobs: JobInfo[];
}

export interface ModelInfo {
  name: string;
  fieldCount: number;
  fields: Array<{
    name: string;
    type: string;
    hasDefault: boolean;
  }>;
}

export interface EndpointInfo {
  method: 'GET' | 'POST';
  path: string;
  parameterCount: number;
  parameters: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
  returnType: string;
}

export interface JobInfo {
  name: string;
  schedule: string;
  statementCount: number;
}
