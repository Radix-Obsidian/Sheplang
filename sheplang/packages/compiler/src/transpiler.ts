import type { GenFile, GenResult } from './types.js';
import type { AppModel } from '@goldensheepai/sheplang-language';
import { templateTsConfig, templateModels, templateActions, templateViews, templateIndex } from './templates.js';
import { templateApiRoutes, templateApiPackageJson } from './api-templates.js';
import { 
  templateStateMachineEnum, 
  templateStateMachinePrismaSchema, 
  templateStateTransitionAPI, 
  templateStateManagementUI,
  generateStateMachineCode 
} from './state-machine-templates.js';
import { 
  templateJobScheduler, 
  templateJobManagementAPI, 
  templateJobPrismaSchema,
  processJobs 
} from './job-templates.js';
import Handlebars from 'handlebars';

// Register Handlebars helpers
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('upperCase', function(str: string) {
  return str.toUpperCase();
});

Handlebars.registerHelper('pascalCase', function(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('camelCase', function(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
});

Handlebars.registerHelper('kebabCase', function(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
});

Handlebars.registerHelper('spacedCase', function(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
});

Handlebars.registerHelper('getStatusColor', function(status: string) {
  const colorMap: Record<string, string> = {
    'pending': 'yellow',
    'processing': 'blue', 
    'shipped': 'purple',
    'delivered': 'green',
    'cancelled': 'red',
    'refunded': 'gray',
    'active': 'green',
    'inactive': 'gray',
    'suspended': 'orange',
    'draft': 'gray',
    'published': 'green',
    'archived': 'orange'
  };
  return colorMap[status.toLowerCase()] || 'blue';
});

function compileTemplate(template: string, data: any): string {
  const compiled = Handlebars.compile(template);
  return compiled(data);
}

export function transpile(app: AppModel): GenResult {
  const files: GenFile[] = [];

  // tsconfig
  files.push({ path: 'tsconfig.json', content: templateTsConfig() });

  // models (includes Prisma schema)
  for (const f of templateModels(app)) files.push(f);
  
  // actions (frontend API calls)
  for (const f of templateActions(app)) files.push(f);
  
  // views (React components)
  for (const f of templateViews(app)) files.push(f);
  
  // API routes (Express backend)
  for (const f of templateApiRoutes(app)) files.push(f);
  
  // package.json for API
  files.push(templateApiPackageJson(app));
  
  // Phase II: State Machines - Generate if any models have status
  const modelsWithStatus = app.datas.filter((data): data is typeof data & { status: NonNullable<typeof data.status> } => 
    data.status !== undefined && data.status !== null
  );
  
  if (modelsWithStatus.length > 0) {
    const stateMachineContext = {
      models: modelsWithStatus.map(d => ({ name: d.name, status: d.status })),
      workflows: app.workflows || []
    };
    
    // State machine Prisma schema additions
    files.push({
      path: 'api/prisma/state-machine-schema.prisma',
      content: compileTemplate(templateStateMachinePrismaSchema, stateMachineContext)
    });
    
    // State transition API routes
    files.push({
      path: 'api/routes/state-transitions.ts',
      content: compileTemplate(templateStateTransitionAPI, stateMachineContext)
    });
    
    // State management UI components
    files.push({
      path: 'components/state-management.tsx',
      content: compileTemplate(templateStateManagementUI, stateMachineContext)
    });
  }
  
  // Phase II: Background Jobs - Generate if app has jobs
  const jobs = app.jobs;
  if (jobs && jobs.length > 0) {
    // Process jobs to convert natural language to cron patterns
    const processedJobs = processJobs(jobs);
    
    const jobContext = {
      jobs: processedJobs
    };
    
    // Job scheduler
    files.push({
      path: 'api/services/job-scheduler.ts',
      content: compileTemplate(templateJobScheduler, jobContext)
    });
    
    // Job management API routes
    files.push({
      path: 'api/routes/jobs.ts',
      content: compileTemplate(templateJobManagementAPI, jobContext)
    });
    
    // Job Prisma schema additions
    files.push({
      path: 'api/prisma/job-schema.prisma',
      content: compileTemplate(templateJobPrismaSchema, jobContext)
    });
  }
  
  // index
  files.push(templateIndex(app));

  return { appName: app.name, files };
}
