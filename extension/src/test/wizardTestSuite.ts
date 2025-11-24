/**
 * ShepLang Project Wizard Test Suite
 * 
 * Tests the wizard with multiple project types and scenarios
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ProjectQuestionnaire } from '../wizard/types';
import { ScaffoldingAgent } from '../wizard/scaffoldingAgent';
import { SyntaxValidator } from '../validation/syntaxValidator';

export interface TestScenario {
  name: string;
  description: string;
  questionnaire: ProjectQuestionnaire;
  expectedFiles: string[];
  expectedEntities?: string[];
  expectedIntegrations?: string[];
}

export interface TestResult {
  scenario: string;
  success: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  generatedFiles: string[];
  syntaxErrors: { [file: string]: any[] };
}

export class WizardTestSuite {
  private workspaceRoot: string;
  private testResults: TestResult[] = [];
  private syntaxValidator: SyntaxValidator;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.syntaxValidator = SyntaxValidator.getInstance();
  }

  /**
   * Run all test scenarios
   */
  public async runAllTests(): Promise<TestResult[]> {
    const scenarios = this.getTestScenarios();
    this.testResults = [];

    console.log(`🧪 Starting wizard test suite with ${scenarios.length} scenarios...`);

    for (const scenario of scenarios) {
      console.log(`\n📋 Testing: ${scenario.name}`);
      const result = await this.runScenario(scenario);
      this.testResults.push(result);

      console.log(`${result.success ? '✅' : '❌'} ${scenario.name} (${result.duration}ms)`);
      if (!result.success) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    }

    await this.generateTestReport();
    return this.testResults;
  }

  /**
   * Run a single test scenario
   */
  private async runScenario(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      scenario: scenario.name,
      success: true,
      duration: 0,
      errors: [],
      warnings: [],
      generatedFiles: [],
      syntaxErrors: {}
    };

    try {
      // Create unique test directory
      const testName = scenario.name.toLowerCase().replace(/\s+/g, '-');
      const testDir = path.join(this.workspaceRoot, `test-${testName}-${Date.now()}`);

      // Clean up any existing test directory
      await this.cleanupDirectory(testDir);

      // Run scaffolding agent
      const scaffoldingAgent = new ScaffoldingAgent(this.workspaceRoot);

      // Override the project path to use test directory
      const originalCreateProjectStructure = scaffoldingAgent['createProjectStructure'].bind(scaffoldingAgent);
      scaffoldingAgent['createProjectStructure'] = async (questionnaire: ProjectQuestionnaire) => {
        const projectPath = testDir;

        // Create main project folder
        await fs.mkdir(projectPath, { recursive: true });

        // Create subdirectories
        const folders = ['.sheplang', 'entities', 'flows', 'screens', 'integrations', 'config'];
        for (const folder of folders) {
          await fs.mkdir(path.join(projectPath, folder), { recursive: true });
        }

        return projectPath;
      };

      // Generate project
      await scaffoldingAgent.generateProject(scenario.questionnaire);

      // Verify expected files exist
      await this.verifyFiles(testDir, scenario.expectedFiles, result);

      // Validate syntax of generated .shep files
      await this.validateGeneratedFiles(testDir, result);

      // Clean up test directory
      await this.cleanupDirectory(testDir);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Define test scenarios
   */
  private getTestScenarios(): TestScenario[] {
    return [
      {
        name: 'SaaS Dashboard',
        description: 'Complete SaaS application with authentication and analytics',
        questionnaire: this.createSaaSQuestionnaire(),
        expectedFiles: [
          'README.md',
          'NEXT_STEPS.md',
          '.sheplang/project.json',
          'entities/User.shep',
          'entities/Subscription.shep',
          'flows/auth/authentication.shep',
          'flows/analytics/analytics.shep',
          'screens/dashboard/main.shep',
          'screens/user/list.shep',
          'integrations/stripe.shep',
          'integrations/sendgrid.shep'
        ],
        expectedEntities: ['User', 'Subscription'],
        expectedIntegrations: ['stripe', 'sendgrid']
      },
      {
        name: 'E-commerce Store',
        description: 'Online store with products, cart, and payments',
        questionnaire: this.createEcommerceQuestionnaire(),
        expectedFiles: [
          'README.md',
          'entities/Product.shep',
          'entities/Order.shep',
          'entities/Customer.shep',
          'flows/auth/authentication.shep',
          'screens/products/list.shep',
          'screens/cart/list.shep',
          'integrations/stripe.shep',
          'integrations/sendgrid.shep'
        ],
        expectedEntities: ['Product', 'Order', 'Customer'],
        expectedIntegrations: ['stripe', 'sendgrid']
      },
      {
        name: 'Content Platform',
        description: 'Blog/content platform with authors and articles',
        questionnaire: this.createContentPlatformQuestionnaire(),
        expectedFiles: [
          'README.md',
          'entities/Article.shep',
          'entities/Author.shep',
          'screens/articles/list.shep',
          'screens/authors/list.shep',
          'integrations/sendgrid.shep'
        ],
        expectedEntities: ['Article', 'Author'],
        expectedIntegrations: ['sendgrid']
      },
      {
        name: 'Mobile-First App',
        description: 'Simple mobile app with basic features',
        questionnaire: this.createMobileFirstQuestionnaire(),
        expectedFiles: [
          'README.md',
          'entities/User.shep',
          'screens/dashboard/main.shep'
        ],
        expectedEntities: ['User'],
        expectedIntegrations: []
      },
      {
        name: 'Custom Application',
        description: 'Custom app with complex entities and integrations',
        questionnaire: this.createCustomQuestionnaire(),
        expectedFiles: [
          'README.md',
          'entities/Project.shep',
          'entities/Task.shep',
          'entities/User.shep',
          'flows/auth/authentication.shep',
          'integrations/stripe.shep',
          'integrations/aws-s3.shep',
          'integrations/clerk.shep'
        ],
        expectedEntities: ['Project', 'Task', 'User'],
        expectedIntegrations: ['stripe', 'aws-s3', 'clerk']
      },
      {
        name: 'Minimal App',
        description: 'Smallest possible valid application',
        questionnaire: this.createMinimalQuestionnaire(),
        expectedFiles: [
          'README.md',
          'entities/User.shep',
          'screens/dashboard/main.shep'
        ],
        expectedEntities: ['User'],
        expectedIntegrations: []
      }
    ];
  }

  /**
   * Create SaaS questionnaire
   */
  private createSaaSQuestionnaire(): ProjectQuestionnaire {
    return {
      projectName: 'test-saas-app',
      projectType: 'saas-dashboard',
      description: 'Test SaaS application',
      features: [
        { name: 'User authentication', description: 'Login and registration' },
        { name: 'Analytics dashboard', description: 'Business metrics and charts' },
        { name: 'Subscription management', description: 'Billing and plans' }
      ],
      entities: [
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'subscriptionTier', type: 'text' },
            { name: 'createdAt', type: 'date' }
          ]
        },
        {
          name: 'Subscription',
          fields: [
            { name: 'userId', type: 'text', required: true },
            { name: 'plan', type: 'text', required: true },
            { name: 'status', type: 'text' },
            { name: 'nextBillingDate', type: 'date' }
          ]
        }
      ],
      roleType: 'multiple-roles',
      roles: [{ name: 'admin', permissions: [] }, { name: 'user', permissions: [] }],
      integrations: [
        { category: 'payments', service: 'Stripe' },
        { category: 'email', service: 'SendGrid' }
      ],
      apiStyle: 'REST',
      realtime: false,
      deployment: 'Vercel'
    };
  }

  /**
   * Create e-commerce questionnaire
   */
  private createEcommerceQuestionnaire(): ProjectQuestionnaire {
    return {
      projectName: 'test-ecommerce',
      projectType: 'ecommerce',
      description: 'Test e-commerce store',
      features: [
        { name: 'Product catalog', description: 'Browse and search products' },
        { name: 'Shopping cart', description: 'Cart management' },
        { name: 'Order processing', description: 'Checkout and payments' }
      ],
      entities: [
        {
          name: 'Product',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', required: true },
            { name: 'description', type: 'text' },
            { name: 'category', type: 'text' }
          ]
        },
        {
          name: 'Customer',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'address', type: 'text' }
          ]
        },
        {
          name: 'Order',
          fields: [
            { name: 'customerId', type: 'text', required: true },
            { name: 'total', type: 'number', required: true },
            { name: 'status', type: 'text' },
            { name: 'orderDate', type: 'date' }
          ]
        }
      ],
      roleType: 'multiple-roles',
      roles: [{ name: 'customer', permissions: [] }, { name: 'admin', permissions: [] }],
      integrations: [
        { category: 'payments', service: 'Stripe' },
        { category: 'email', service: 'SendGrid' }
      ],
      apiStyle: 'REST',
      realtime: false,
      deployment: 'AWS'
    };
  }

  /**
   * Create content platform questionnaire
   */
  private createContentPlatformQuestionnaire(): ProjectQuestionnaire {
    return {
      projectName: 'test-content-platform',
      projectType: 'content-platform',
      description: 'Test content platform',
      features: [
        { name: 'Article management', description: 'Create and publish articles' },
        { name: 'Author profiles', description: 'Author information and bios' }
      ],
      entities: [
        {
          name: 'Article',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'content', type: 'text', required: true },
            { name: 'authorId', type: 'text', required: true },
            { name: 'publishedAt', type: 'date' }
          ]
        },
        {
          name: 'Author',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'bio', type: 'text' },
            { name: 'email', type: 'text' }
          ]
        }
      ],
      roleType: 'multiple-roles',
      roles: [{ name: 'author', permissions: [] }, { name: 'editor', permissions: [] }, { name: 'reader', permissions: [] }],
      integrations: [
        { category: 'email', service: 'SendGrid' }
      ],
      apiStyle: 'REST',
      realtime: false,
      deployment: 'Other'
    };
  }

  /**
   * Create mobile-first questionnaire
   */
  private createMobileFirstQuestionnaire(): ProjectQuestionnaire {
    return {
      projectName: 'test-mobile-app',
      projectType: 'mobile-first',
      description: 'Test mobile-first app',
      features: [
        { name: 'User profiles', description: 'Basic user management' }
      ],
      entities: [
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'phone', type: 'text' }
          ]
        }
      ],
      roleType: 'single-user',
      roles: [],
      integrations: [],
      apiStyle: 'REST',
      realtime: true,
      deployment: 'Vercel'
    };
  }

  /**
   * Create custom application questionnaire
   */
  private createCustomQuestionnaire(): ProjectQuestionnaire {
    return {
      projectName: 'test-custom-app',
      projectType: 'custom',
      description: 'Test custom application',
      features: [
        { name: 'Project management', description: 'Task and project tracking' },
        { name: 'Team collaboration', description: 'User collaboration features' }
      ],
      entities: [
        {
          name: 'Project',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'status', type: 'text' },
            { name: 'ownerId', type: 'text', required: true }
          ]
        },
        {
          name: 'Task',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'projectId', type: 'text', required: true },
            { name: 'assigneeId', type: 'text' },
            { name: 'status', type: 'text' },
            { name: 'dueDate', type: 'date' }
          ]
        },
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'role', type: 'text' }
          ]
        }
      ],
      roleType: 'multiple-roles',
      roles: [{ name: 'admin', permissions: [] }, { name: 'manager', permissions: [] }, { name: 'member', permissions: [] }],
      integrations: [
        { category: 'payments', service: 'Stripe' },
        { category: 'storage', service: 'AWS S3' },
        { category: 'auth', service: 'Clerk' }
      ],
      apiStyle: 'REST',
      realtime: true,
      deployment: 'AWS'
    };
  }

  /**
   * Create minimal questionnaire
   */
  private createMinimalQuestionnaire(): ProjectQuestionnaire {
    return {
      projectName: 'test-minimal-app',
      projectType: 'custom',
      description: 'Test minimal application',
      features: [],
      entities: [
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text', required: true }
          ]
        }
      ],
      roleType: 'single-user',
      roles: [],
      integrations: [],
      apiStyle: 'REST',
      realtime: false,
      deployment: 'Vercel'
    };
  }

  /**
   * Verify expected files exist
   */
  private async verifyFiles(testDir: string, expectedFiles: string[], result: TestResult): Promise<void> {
    for (const file of expectedFiles) {
      const filePath = path.join(testDir, file);
      try {
        await fs.access(filePath);
        result.generatedFiles.push(file);
      } catch (error) {
        result.success = false;
        result.errors.push(`Missing expected file: ${file}`);
      }
    }
  }

  /**
   * Validate syntax of generated .shep files
   */
  private async validateGeneratedFiles(testDir: string, result: TestResult): Promise<void> {
    const shepFiles = result.generatedFiles.filter(f => f.endsWith('.shep'));

    for (const file of shepFiles) {
      const filePath = path.join(testDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const validation = await this.syntaxValidator.validate(content, file);

        if (!validation.isValid) {
          result.syntaxErrors[file] = validation.errors;
          result.warnings.push(`Syntax errors in ${file}: ${validation.errors.length} errors`);
        }

        if (validation.warnings.length > 0) {
          result.warnings.push(`Warnings in ${file}: ${validation.warnings.length} warnings`);
        }
      } catch (error) {
        result.success = false;
        result.errors.push(`Failed to validate ${file}: ${error}`);
      }
    }
  }

  /**
   * Clean up test directory
   */
  private async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, that's ok
    }
  }

  /**
   * Generate test report
   */
  private async generateTestReport(): Promise<void> {
    const reportPath = path.join(this.workspaceRoot, 'wizard-test-report.md');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    let report = `# ShepLang Wizard Test Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Tests:** ${totalTests}\n`;
    report += `**Passed:** ${passedTests} ✅\n`;
    report += `**Failed:** ${failedTests} ❌\n`;
    report += `**Success Rate:** ${Math.round((passedTests / totalTests) * 100)}%\n`;
    report += `**Average Duration:** ${Math.round(avgDuration)}ms\n\n`;

    report += `## Test Results\n\n`;

    for (const result of this.testResults) {
      report += `### ${result.scenario}\n\n`;
      report += `- **Status:** ${result.success ? '✅ Passed' : '❌ Failed'}\n`;
      report += `- **Duration:** ${result.duration}ms\n`;
      report += `- **Files Generated:** ${result.generatedFiles.length}\n`;

      if (result.errors.length > 0) {
        report += `- **Errors:** ${result.errors.length}\n`;
        for (const error of result.errors) {
          report += `  - ${error}\n`;
        }
      }

      if (result.warnings.length > 0) {
        report += `- **Warnings:** ${result.warnings.length}\n`;
        for (const warning of result.warnings) {
          report += `  - ${warning}\n`;
        }
      }

      if (Object.keys(result.syntaxErrors).length > 0) {
        report += `- **Syntax Errors:** ${Object.keys(result.syntaxErrors).length} files\n`;
        for (const [file, errors] of Object.entries(result.syntaxErrors)) {
          report += `  - ${file}: ${errors.length} errors\n`;
        }
      }

      report += `\n`;
    }

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`\n📊 Test report generated: ${reportPath}`);
  }

  /**
   * Get summary statistics
   */
  public getSummary(): {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    avgDuration: number;
    totalErrors: number;
    totalWarnings: number;
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;
    const avgDuration = total > 0 ? this.testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0;
    const totalErrors = this.testResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = this.testResults.reduce((sum, r) => sum + r.warnings.length, 0);

    return {
      total,
      passed,
      failed,
      successRate,
      avgDuration,
      totalErrors,
      totalWarnings
    };
  }
}
