# Background Jobs & Scheduling Specification

**Version:** 2.0.0  
**Date:** November 21, 2025  
**Status:** 🟡 IN DEVELOPMENT  
**Research:** node-cron official documentation + DigitalOcean best practices

---

## 🎯 **Specification Goal**

Add background job and scheduling syntax to ShepLang for automated tasks, email reminders, payment processing, data cleanup, and other time-based operations.

---

## 📖 **Research Foundation**

### **node-cron Official Syntax**
Based on [node-cron GitHub Documentation](https://github.com/node-cron/node-cron):

```javascript
// Basic scheduling
cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
});

// Cron format: second minute hour day month dayOfWeek
// ┌────────────── second (optional)
// │ ┌──────────── minute
// │ │ ┌────────── hour
// │ │ │ ┌──────── day of month
// │ │ │ │ ┌────── month
// │ │ │ │ │ ┌──── day of week
// │ │ │ │ │ │
// * * * * * *
```

### **DigitalOcean Best Practices**
Based on [DigitalOcean node-cron Tutorial](https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples):

- Use proper error handling for scheduled tasks
- Log job execution for monitoring
- Support database cleanup operations
- Enable email scheduling capabilities
- Implement job status tracking

---

## 🚀 **Syntax Design**

### **Basic Scheduled Jobs**
```sheplang
job SendEmailReminders:
  schedule: daily at 9am
  action:
    for user in User where emailNotifications = true:
      send email "Daily Reminder" to user.email

job CleanupOldLogs:
  schedule: every Sunday at midnight
  action:
    delete Log where createdAt < 30.days.ago

job ProcessPendingPayments:
  schedule: every 5 minutes
  action:
    for order in Order where status = pending and createdAt < 1.hour.ago:
      call stripe.charge with order.total, order.paymentToken
      if success:
        set order.status = processing
      else:
        set order.status = cancelled
```

### **Event-Triggered Jobs**
```sheplang
job WelcomeNewUser:
  trigger: on User.created
  delay: 1 hour
  action:
    send email "Welcome to MyApp" to user.email with template "welcome"

job OrderFollowUp:
  trigger: on Order.status -> delivered
  delay: 3 days
  action:
    send email "How was your order?" to order.customer.email with template "feedback"

job PaymentRetry:
  trigger: on Payment.failed
  schedule: retry every 4 hours for 3 days
  action:
    call stripe.charge with payment.amount, payment.token
    if success:
      set payment.status = completed
    else:
      increment payment.retryCount
```

### **Complex Workflow Jobs**
```sheplang
job MonthlyReporting:
  schedule: first Monday of every month at 8am
  action:
    // Generate monthly analytics
    analytics = calculate monthly_stats for last_month
    report = generate pdf_report with analytics
    
    // Send to all admins
    for admin in User where role = admin:
      send email "Monthly Report" to admin.email with attachment report

job DatabaseMaintenance:
  schedule: every night at 2am
  action:
    // Archive old records
    archive Order where createdAt < 1.year.ago
    archive Log where createdAt < 3.months.ago
    
    // Optimize database
    optimize database tables
    
    // Send status report
    send notification "Database maintenance completed" to admin_channel
```

---

## 🛠️ **Grammar Implementation**

### **Extended Langium Grammar**
```langium
// Add to shep.langium

JobDeclaration:
  'job' name=ID ':' 
  (schedule=JobSchedule | trigger=JobTrigger)
  (delay=JobDelay)?
  'action:' actions+=JobAction*;

JobSchedule:
  'schedule:' timing=ScheduleTiming;

ScheduleTiming:
  CronExpression | NaturalLanguage;

CronExpression:
  'cron' pattern=STRING;

NaturalLanguage:
  ('every' frequency=TimeFrequency) |
  ('daily' 'at' time=TIME) |
  ('weekly' 'on' day=DAY 'at' time=TIME) |
  ('monthly' 'on' day=NUMBER 'at' time=TIME);

JobTrigger:
  'trigger:' event=TriggerEvent;

TriggerEvent:
  ('on' entity=ID '.' field=ID) |
  ('on' entity=ID '.' 'created') |
  ('on' entity=ID '.' field=ID '->' value=ID);

JobDelay:
  'delay:' duration=Duration;

Duration:
  amount=NUMBER unit=TimeUnit;

TimeUnit:
  'minutes' | 'hours' | 'days' | 'weeks';

JobAction:
  ForLoop | SendEmail | DatabaseQuery | ApiCall | Assignment;
```

### **AST Type Extensions**
```typescript
// Add to types.ts

export interface JobDeclaration extends AstNode {
  name: string;
  schedule?: JobSchedule;
  trigger?: JobTrigger;
  delay?: JobDelay;
  actions: JobAction[];
}

export interface JobSchedule extends AstNode {
  timing: ScheduleTiming;
}

export interface ScheduleTiming extends AstNode {
  type: 'cron' | 'natural';
  pattern?: string;
  frequency?: string;
  time?: string;
  day?: string;
}

export interface JobTrigger extends AstNode {
  event: TriggerEvent;
}

export interface TriggerEvent extends AstNode {
  entity: string;
  field?: string;
  eventType: 'created' | 'updated' | 'transition';
  value?: string;
}
```

---

## 📊 **Generated Job System**

### **Job Registry and Scheduler**
```typescript
// Generated job-scheduler.ts
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from './email-service';

const prisma = new PrismaClient();

export class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  
  constructor() {
    this.initializeJobs();
  }
  
  initializeJobs() {
    // Generated from ShepLang job definitions
    this.scheduleJob('SendEmailReminders', '0 9 * * *', this.sendEmailReminders);
    this.scheduleJob('CleanupOldLogs', '0 0 * * 0', this.cleanupOldLogs);
    this.scheduleJob('ProcessPendingPayments', '*/5 * * * *', this.processPendingPayments);
  }
  
  private scheduleJob(name: string, pattern: string, handler: () => Promise<void>) {
    const task = cron.schedule(pattern, async () => {
      console.log(`Running job: ${name} at ${new Date()}`);
      
      try {
        await this.logJobExecution(name, 'started');
        await handler();
        await this.logJobExecution(name, 'completed');
      } catch (error) {
        console.error(`Job ${name} failed:`, error);
        await this.logJobExecution(name, 'failed', error.message);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
    
    this.jobs.set(name, task);
  }
  
  private async sendEmailReminders() {
    const users = await prisma.user.findMany({
      where: { emailNotifications: true }
    });
    
    for (const user of users) {
      await sendEmail(user.email, 'Daily Reminder', 'daily-reminder');
    }
  }
  
  private async cleanupOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await prisma.log.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });
  }
  
  private async processPendingPayments() {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: oneHourAgo }
      }
    });
    
    for (const order of pendingOrders) {
      try {
        // Process payment with Stripe
        const paymentResult = await this.processPayment(order);
        
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: paymentResult.success ? 'PROCESSING' : 'CANCELLED'
          }
        });
      } catch (error) {
        console.error(`Payment processing failed for order ${order.id}:`, error);
      }
    }
  }
  
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
}
```

### **Database Schema for Job Tracking**
```prisma
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
```

---

## 🌐 **Generated Job Management API**

### **Job Control Endpoints**
```typescript
// Generated job-routes.ts
import { Router } from 'express';
import { jobScheduler } from './job-scheduler';

const router = Router();

// GET /api/jobs - List all jobs
router.get('/', async (req, res) => {
  const jobs = await prisma.scheduledJob.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(jobs);
});

// POST /api/jobs/:name/run - Run job manually
router.post('/:name/run', async (req, res) => {
  const { name } = req.params;
  
  try {
    await jobScheduler.runJobManually(name);
    res.json({ success: true, message: `Job ${name} executed successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/jobs/:name/toggle - Enable/disable job
router.put('/:name/toggle', async (req, res) => {
  const { name } = req.params;
  const { enabled } = req.body;
  
  const job = await prisma.scheduledJob.update({
    where: { name },
    data: { enabled }
  });
  
  if (enabled) {
    jobScheduler.enableJob(name);
  } else {
    jobScheduler.disableJob(name);
  }
  
  res.json(job);
});

// GET /api/jobs/:name/history - Job execution history
router.get('/:name/history', async (req, res) => {
  const { name } = req.params;
  const { limit = 50 } = req.query;
  
  const history = await prisma.jobExecution.findMany({
    where: { jobName: name },
    orderBy: { executedAt: 'desc' },
    take: Number(limit)
  });
  
  res.json(history);
});

export default router;
```

---

## 🎨 **Generated Job Management UI**

### **Job Dashboard Component**
```tsx
interface JobDashboardProps {
  jobs: ScheduledJob[];
}

export function JobDashboard({ jobs }: JobDashboardProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Job List */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Scheduled Jobs</h2>
        <div className="space-y-3">
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onSelect={() => setSelectedJob(job.name)}
              onToggle={(enabled) => toggleJob(job.name, enabled)}
              onRunManually={() => runJobManually(job.name)}
            />
          ))}
        </div>
      </div>
      
      {/* Job Details */}
      <div className="lg:col-span-1">
        {selectedJob && (
          <JobDetails jobName={selectedJob} />
        )}
      </div>
    </div>
  );
}

interface JobCardProps {
  job: ScheduledJob;
  onSelect: () => void;
  onToggle: (enabled: boolean) => void;
  onRunManually: () => void;
}

function JobCard({ job, onSelect, onToggle, onRunManually }: JobCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md cursor-pointer" onClick={onSelect}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{job.name}</h3>
        <StatusBadge enabled={job.enabled} />
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>Pattern: {job.pattern}</p>
        <p>Last run: {job.lastRun ? formatDate(job.lastRun) : 'Never'}</p>
        <p>Next run: {job.nextRun ? formatDate(job.nextRun) : 'N/A'}</p>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(!job.enabled); }}
          className={`px-3 py-1 rounded text-sm ${
            job.enabled 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {job.enabled ? 'Disable' : 'Enable'}
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onRunManually(); }}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
        >
          Run Now
        </button>
      </div>
    </div>
  );
}
```

### **Natural Language Schedule Converter**
```typescript
// Generated schedule-converter.ts
export function convertNaturalToCron(natural: string): string {
  const patterns = {
    'daily at 9am': '0 9 * * *',
    'every Sunday at midnight': '0 0 * * 0',
    'every 5 minutes': '*/5 * * * *',
    'first Monday of every month at 8am': '0 8 1-7 * 1',
    'every night at 2am': '0 2 * * *',
    'weekly on Friday at 5pm': '0 17 * * 5',
    'every hour': '0 * * * *',
    'every 30 minutes': '*/30 * * * *'
  };
  
  return patterns[natural] || natural;
}

export function validateCronPattern(pattern: string): boolean {
  try {
    cron.validate(pattern);
    return true;
  } catch {
    return false;
  }
}

export function getNextRunTime(pattern: string): Date | null {
  try {
    const task = cron.schedule(pattern, () => {}, { scheduled: false });
    return task.nextDates().next().value.toDate();
  } catch {
    return null;
  }
}
```

---

## ✅ **Success Criteria**

### **Grammar Extension**
- [ ] Langium grammar accepts job scheduling syntax
- [ ] Natural language scheduling patterns work
- [ ] Event-triggered job syntax parsing
- [ ] Job action statements supported

### **Job System Generation**
- [ ] node-cron integration with proper patterns
- [ ] Job execution tracking and logging
- [ ] Manual job execution capabilities
- [ ] Job enable/disable functionality

### **API Generation**
- [ ] Job management endpoints
- [ ] Job history and monitoring
- [ ] Real-time job status updates
- [ ] Error handling and reporting

### **Frontend Generation**
- [ ] Job dashboard with visual status
- [ ] Manual job execution controls
- [ ] Job history timeline view
- [ ] Natural language schedule input

### **Real-World Examples**
- [ ] Email reminder system
- [ ] Payment processing automation
- [ ] Database cleanup jobs
- [ ] Report generation workflow

---

## 🔗 **Integration Requirements**

### **Email Service Integration**
```typescript
// Email service for job actions
export interface EmailService {
  send(to: string, subject: string, template: string, data?: any): Promise<void>;
}
```

### **External API Integration**
```typescript
// Support for external API calls in jobs
export interface ExternalAPICall {
  service: string;
  method: string;
  data: any;
}
```

### **Database Operations**
```typescript
// Support for complex database operations
export interface DatabaseOperation {
  type: 'query' | 'update' | 'delete' | 'archive';
  entity: string;
  conditions: any;
  data?: any;
}
```

---

*Specification completed based on official node-cron documentation and DigitalOcean best practices*
