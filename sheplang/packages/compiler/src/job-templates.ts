// Phase II: Background Jobs Compiler Templates
// Based on official node-cron documentation

export const templateJobScheduler = `
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from './email-service.js';

const prisma = new PrismaClient();

export class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  
  constructor() {
    this.initializeJobs();
  }
  
  initializeJobs() {
    {{#each jobs}}
    {{#if schedule}}
    this.scheduleJob('{{name}}', '{{schedule.cronPattern}}', this.{{camelCase name}}.bind(this));
    {{/if}}
    {{/each}}
  }
  
  private scheduleJob(name: string, pattern: string, handler: () => Promise<void>) {
    const task = cron.schedule(pattern, async () => {
      console.log(\`Running job: \${name} at \${new Date()}\`);
      
      try {
        await this.logJobExecution(name, 'started');
        await handler();
        await this.logJobExecution(name, 'completed');
      } catch (error) {
        console.error(\`Job \${name} failed:\`, error);
        await this.logJobExecution(name, 'failed', error.message);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
    
    this.jobs.set(name, task);
  }
  
  {{#each jobs}}
  private async {{camelCase name}}() {
    {{#each actions}}
    {{#if (eq kind 'raw')}}
    // {{text}}
    console.log('{{text}}');
    {{/if}}
    {{#if (eq kind 'for')}}
    {{#if (eq type 'each')}}
    const {{variable}}Items = await prisma.{{collection}}.findMany();
    for (const {{variable}} of {{variable}}Items) {
      {{#each body}}
      {{#if (eq kind 'raw')}}
      // {{text}}
      console.log('{{text}}');
      {{/if}}
      {{/each}}
    }
    {{/if}}
    {{/if}}
    {{/each}}
  }
  {{/each}}
  
  private async logJobExecution(jobName: string, status: string, error?: string) {
    await prisma.jobExecution.create({
      data: {
        jobName,
        status,
        error,
        executedAt: new Date()
      }
    });
  }
  
  public async runJobManually(name: string) {
    const handler = this[\`\${name.charAt(0).toLowerCase()}\${name.slice(1)}\`];
    if (handler && typeof handler === 'function') {
      await handler.call(this);
    } else {
      throw new Error(\`Job \${name} not found\`);
    }
  }
  
  public enableJob(name: string) {
    const task = this.jobs.get(name);
    if (task) {
      task.start();
    }
  }
  
  public disableJob(name: string) {
    const task = this.jobs.get(name);
    if (task) {
      task.stop();
    }
  }
}

export const jobScheduler = new JobScheduler();
`;

export const templateJobManagementAPI = `
// Generated job management routes
import { Router } from 'express';
import { jobScheduler } from './job-scheduler.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/jobs - List all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = [
      {{#each jobs}}
      {
        name: '{{name}}',
        {{#if schedule}}
        type: 'scheduled',
        pattern: '{{schedule.cronPattern}}',
        {{/if}}
        {{#if trigger}}
        type: 'triggered',
        event: '{{trigger.entity}}.{{trigger.eventType}}',
        {{/if}}
        enabled: true
      },
      {{/each}}
    ];
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs/:name/run - Run job manually
router.post('/:name/run', async (req, res) => {
  const { name } = req.params;
  
  try {
    await jobScheduler.runJobManually(name);
    res.json({ success: true, message: \`Job \${name} executed successfully\` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/jobs/:name/toggle - Enable/disable job
router.put('/:name/toggle', async (req, res) => {
  const { name } = req.params;
  const { enabled } = req.body;
  
  try {
    if (enabled) {
      jobScheduler.enableJob(name);
    } else {
      jobScheduler.disableJob(name);
    }
    
    res.json({ success: true, enabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:name/history - Job execution history
router.get('/:name/history', async (req, res) => {
  const { name } = req.params;
  const { limit = 50 } = req.query;
  
  try {
    const history = await prisma.jobExecution.findMany({
      where: { jobName: name },
      orderBy: { executedAt: 'desc' },
      take: Number(limit)
    });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`;

export const templateJobPrismaSchema = `
model JobExecution {
  id          String   @id @default(uuid())
  jobName     String
  status      String   // 'started', 'completed', 'failed'
  error       String?
  executedAt  DateTime
  duration    Int?     // milliseconds
  
  @@index([jobName, executedAt])
}

model ScheduledJob {
  id          String   @id @default(uuid())
  name        String   @unique
  pattern     String   // cron pattern
  enabled     Boolean  @default(true)
  lastRun     DateTime?
  nextRun     DateTime?
  runCount    Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`;

export function convertNaturalToCron(natural: string): string {
  const patterns: Record<string, string> = {
    'daily at 9am': '0 9 * * *',
    'daily at midnight': '0 0 * * *',
    'every Sunday at midnight': '0 0 * * 0',
    'every 5 minutes': '*/5 * * * *',
    'every 30 minutes': '*/30 * * * *',
    'every hour': '0 * * * *',
    'every night at 2am': '0 2 * * *',
    'weekly on Friday at 5pm': '0 17 * * 5',
    'first Monday of every month at 8am': '0 8 1-7 * 1'
  };
  
  return patterns[natural] || natural;
}

export interface JobCompilerContext {
  jobs: Array<{
    name: string;
    schedule?: {
      type: 'cron' | 'natural';
      pattern?: string;
      expression?: string;
      cronPattern?: string;
    };
    trigger?: {
      type: 'lifecycle' | 'state_transition';
      entity: string;
      eventType?: string;
      field?: string;
      value?: string;
    };
    delay?: {
      amount: string;
      unit: string;
    };
    actions: Array<{
      kind: string;
      [key: string]: any;
    }>;
  }>;
}

export function processJobs(jobs: JobCompilerContext['jobs']): JobCompilerContext['jobs'] {
  return jobs.map(job => {
    if (job.schedule) {
      // Convert natural language to cron pattern
      if (job.schedule.type === 'natural' && job.schedule.expression) {
        job.schedule.cronPattern = convertNaturalToCron(job.schedule.expression);
      } else if (job.schedule.type === 'cron' && job.schedule.pattern) {
        job.schedule.cronPattern = job.schedule.pattern;
      }
    }
    return job;
  });
}
