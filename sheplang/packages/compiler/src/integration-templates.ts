/**
 * Phase 4-02: Third-Party Integrations - Code Generation
 * Generates integration client code for external services
 */

export interface IntegrationConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
}

/**
 * Generate Stripe integration client
 */
export function generateStripeClient(): string {
  return `// Auto-generated Stripe Integration
import Stripe from 'stripe';

export class StripeClient {
  private stripe: Stripe;
  
  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16'
    });
  }
  
  async createCharge(amount: number, currency: string, customerId: string): Promise<any> {
    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || 'usd',
        customer: customerId
      });
      
      return {
        success: true,
        chargeId: charge.id,
        status: charge.status
      };
    } catch (error: any) {
      console.error('Stripe charge failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async createCustomer(email: string, name: string): Promise<any> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name
      });
      
      return {
        success: true,
        customerId: customer.id
      };
    } catch (error: any) {
      console.error('Stripe customer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
`;
}

/**
 * Generate SendGrid integration client
 */
export function generateSendGridClient(): string {
  return `// Auto-generated SendGrid Integration
import sgMail from '@sendgrid/mail';

export class SendGridClient {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }
  
  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        subject,
        html: body
      };
      
      await sgMail.send(msg);
      
      return {
        success: true,
        message: 'Email sent successfully'
      };
    } catch (error: any) {
      console.error('SendGrid email failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async sendTemplate(to: string, templateId: string, data: any): Promise<any> {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        templateId,
        dynamicTemplateData: data
      };
      
      await sgMail.send(msg);
      
      return {
        success: true,
        message: 'Template email sent successfully'
      };
    } catch (error: any) {
      console.error('SendGrid template email failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
`;
}

/**
 * Generate Twilio integration client
 */
export function generateTwilioClient(): string {
  return `// Auto-generated Twilio Integration
import twilio from 'twilio';

export class TwilioClient {
  private client: any;
  private fromNumber: string;
  
  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }
  
  async sendSMS(to: string, body: string): Promise<any> {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to
      });
      
      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error: any) {
      console.error('Twilio SMS failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
`;
}

/**
 * Generate integration manager that coordinates all integrations
 */
export function generateIntegrationManager(integrations: string[]): string {
  const imports = integrations.map(name => {
    const className = name === 'S3' ? 'S3ClientWrapper' : `${name}Client`;
    return `import { ${className} } from './clients/${name}';`;
  }).join('\n');
  
  const clientProps = integrations.map(name => {
    const className = name === 'S3' ? 'S3ClientWrapper' : `${name}Client`;
    return `  public ${name.toLowerCase()}: ${className};`;
  }).join('\n');
  
  const clientInits = integrations.map(name => {
    const className = name === 'S3' ? 'S3ClientWrapper' : `${name}Client`;
    const envVars = getEnvVarsForIntegration(name);
    return `    this.${name.toLowerCase()} = new ${className}(${envVars});`;
  }).join('\n');
  
  return `// Auto-generated Integration Manager
${imports}

export class IntegrationManager {
${clientProps}
  
  constructor() {
${clientInits}
  }
}

export const integrations = new IntegrationManager();
`;
}

/**
 * Phase 6: Generate AWS S3 integration client
 */
export function generateS3Client(): string {
  return `// Auto-generated AWS S3 Integration
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3ClientWrapper {
  private client: S3Client;
  private bucket: string;
  
  constructor(region: string, accessKeyId: string, secretAccessKey: string, bucket: string) {
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    this.bucket = bucket;
  }
  
  async upload(key: string, body: Buffer | string, contentType?: string): Promise<any> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      });
      
      await this.client.send(command);
      
      return {
        success: true,
        url: \`https://\${this.bucket}.s3.amazonaws.com/\${key}\`,
        key
      };
    } catch (error: any) {
      console.error('S3 upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      
      const url = await getSignedUrl(this.client, command, { expiresIn });
      
      return {
        success: true,
        url
      };
    } catch (error: any) {
      console.error('S3 signed URL generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async delete(key: string): Promise<any> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      
      await this.client.send(command);
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error: any) {
      console.error('S3 delete failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
`;
}

/**
 * Phase 6: Generate Elasticsearch integration client
 */
export function generateElasticsearchClient(): string {
  return `// Auto-generated Elasticsearch Integration
import { Client } from '@elastic/elasticsearch';

export class ElasticsearchClient {
  private client: Client;
  
  constructor(node: string, auth?: { username: string; password: string }) {
    this.client = new Client({
      node,
      auth
    });
  }
  
  async index(indexName: string, id: string, document: any): Promise<any> {
    try {
      const result = await this.client.index({
        index: indexName,
        id,
        document
      });
      
      return {
        success: true,
        id: result._id,
        version: result._version
      };
    } catch (error: any) {
      console.error('Elasticsearch index failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async search(indexName: string, query: any): Promise<any> {
    try {
      const result = await this.client.search({
        index: indexName,
        query
      });
      
      return {
        success: true,
        hits: result.hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          source: hit._source
        })),
        total: result.hits.total
      };
    } catch (error: any) {
      console.error('Elasticsearch search failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async delete(indexName: string, id: string): Promise<any> {
    try {
      const result = await this.client.delete({
        index: indexName,
        id
      });
      
      return {
        success: true,
        result: result.result
      };
    } catch (error: any) {
      console.error('Elasticsearch delete failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async healthCheck(): Promise<any> {
    try {
      const health = await this.client.cluster.health();
      
      return {
        success: true,
        status: health.status,
        clusterName: health.cluster_name
      };
    } catch (error: any) {
      console.error('Elasticsearch health check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
`;
}

/**
 * Get environment variable names for integration
 */
function getEnvVarsForIntegration(name: string): string {
  const envMap: Record<string, string> = {
    'Stripe': 'process.env.STRIPE_API_KEY!',
    'SendGrid': 'process.env.SENDGRID_API_KEY!',
    'Twilio': 'process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!, process.env.TWILIO_FROM_NUMBER!',
    'S3': 'process.env.AWS_REGION!, process.env.AWS_ACCESS_KEY_ID!, process.env.AWS_SECRET_ACCESS_KEY!, process.env.AWS_S3_BUCKET!',
    'Elasticsearch': 'process.env.ELASTICSEARCH_URL!, process.env.ELASTICSEARCH_USERNAME ? { username: process.env.ELASTICSEARCH_USERNAME, password: process.env.ELASTICSEARCH_PASSWORD! } : undefined'
  };
  
  return envMap[name] || 'process.env.API_KEY!';
}
