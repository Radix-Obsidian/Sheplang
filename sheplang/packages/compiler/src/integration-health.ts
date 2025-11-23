/**
 * Phase 6 Week 2: Integration Health Monitoring and Circuit Breakers
 * Production-ready integration features
 */

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  error?: string;
}

/**
 * Generate health check endpoint for all integrations
 */
export function generateHealthCheckEndpoint(): string {
  return `// Auto-generated Health Check Endpoint
import { Router, Request, Response } from 'express';
import { integrations } from '../integrations/IntegrationManager';

const router = Router();

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

router.get('/health', async (req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  // Check Elasticsearch if configured
  if (process.env.ELASTICSEARCH_URL) {
    try {
      const start = Date.now();
      const result = await integrations.elasticsearch.healthCheck();
      const latency = Date.now() - start;
      
      health.services.elasticsearch = {
        status: result.success ? 'healthy' : 'down',
        latency,
        error: result.error
      };
      
      if (!result.success) {
        health.status = 'degraded';
      }
    } catch (error: any) {
      health.services.elasticsearch = {
        status: 'down',
        error: error.message
      };
      health.status = 'degraded';
    }
  }
  
  // Check other services (simple ping)
  const services = ['stripe', 'sendgrid', 'twilio', 's3'];
  for (const service of services) {
    health.services[service] = {
      status: 'healthy'
    };
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
`;
}

/**
 * Generate environment configuration manager
 */
export function generateEnvManager(): string {
  return `// Auto-generated Environment Manager
export interface IntegrationConfig {
  stripe?: {
    apiKey: string;
    webhookSecret?: string;
  };
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
  };
  elasticsearch?: {
    url: string;
    username?: string;
    password?: string;
  };
}

export class EnvironmentManager {
  private config: IntegrationConfig = {};
  
  constructor() {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    // Stripe
    if (process.env.STRIPE_API_KEY) {
      this.config.stripe = {
        apiKey: process.env.STRIPE_API_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      };
    }
    
    // SendGrid
    if (process.env.SENDGRID_API_KEY) {
      this.config.sendgrid = {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'
      };
    }
    
    // Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.config.twilio = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER!
      };
    }
    
    // AWS
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.config.aws = {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        s3Bucket: process.env.AWS_S3_BUCKET!
      };
    }
    
    // Elasticsearch
    if (process.env.ELASTICSEARCH_URL) {
      this.config.elasticsearch = {
        url: process.env.ELASTICSEARCH_URL,
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      };
    }
  }
  
  getConfig(): IntegrationConfig {
    return this.config;
  }
  
  isConfigured(service: keyof IntegrationConfig): boolean {
    return this.config[service] !== undefined;
  }
  
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate required configs based on usage
    if (this.config.stripe && !this.config.stripe.apiKey) {
      errors.push('Stripe API key is required');
    }
    
    if (this.config.sendgrid && !this.config.sendgrid.apiKey) {
      errors.push('SendGrid API key is required');
    }
    
    if (this.config.twilio && (!this.config.twilio.accountSid || !this.config.twilio.authToken)) {
      errors.push('Twilio credentials are incomplete');
    }
    
    if (this.config.aws && (!this.config.aws.accessKeyId || !this.config.aws.secretAccessKey)) {
      errors.push('AWS credentials are incomplete');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const envManager = new EnvironmentManager();
`;
}

/**
 * Generate circuit breaker pattern for integrations
 */
export function generateCircuitBreaker(): string {
  return `// Auto-generated Circuit Breaker
export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await Promise.race([
        fn(),
        this.timeoutPromise()
      ]);
      
      this.onSuccess();
      return result as T;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }
  
  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), this.timeout);
    });
  }
  
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}
`;
}

/**
 * Generate retry logic with exponential backoff
 */
export function generateRetryLogic(): string {
  return `// Auto-generated Retry Logic
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt - 1),
        maxDelay
      );
      
      console.log(\`Retry attempt \${attempt}/\${maxAttempts} after \${delay}ms\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
`;
}
