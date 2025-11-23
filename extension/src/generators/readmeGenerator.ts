/**
 * README Generator for ShepLang Projects
 * 
 * Generates documentation and README files from questionnaire data
 */

import { ProjectQuestionnaire, EntityDefinition, Integration } from '../wizard/types';

export class ReadmeGenerator {
  /**
   * Generate main README.md
   */
  public generateMainReadme(questionnaire: ProjectQuestionnaire): string {
    const projectType = this.getProjectTypeDescription(questionnaire.projectType);
    const entities = questionnaire.entities;
    const features = questionnaire.features;
    
    return `# ${questionnaire.projectName}

${projectType} built with ShepLang - the AI-native full-stack programming language.

## 🚀 Quick Start

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to \`http://localhost:3000\`

## 📋 Project Overview

**Type:** ${questionnaire.projectType}  
**Description:** ${questionnaire.description}

### Key Features

${features.map((f, i) => `${i + 1}. ${f.name}`).join('\n')}

### Data Model

${entities.map(entity => `
#### ${entity.name}
${entity.fields.map(field => 
  `- **${field.name}**: ${field.type}${field.required ? ' (required)' : ''}`
).join('\n')}
`).join('\n')}

## 🏗️ Project Structure

\`\`\`
${questionnaire.projectName}/
├── .sheplang/                    # Project configuration
│   ├── project-config.json      # Wizard settings
│   └── project-config.md        # Human-readable config
├── entities/                     # Data models
│   ├── README.md                 # Entity documentation
${entities.map(e => `│   ├── ${e.name}.shep            # ${e.name} entity`).join('\n')}
├── flows/                        # Business logic
│   ├── README.md                 # Flow documentation
│   ├── auth/                     # Authentication flows
${features.map(f => `│   ├── ${this.sanitizeFolderName(f.name)}/         # ${f.name} flow`).join('\n')}
│   └── webhooks/                 # Integration webhooks
├── screens/                      # UI screens
│   ├── README.md                 # Screen documentation
│   ├── dashboard/                # Main dashboard
${entities.map(e => `│   ├── ${e.name.toLowerCase()}/         # ${e.name} screens`).join('\n')}
├── integrations/                 # External services
│   ├── README.md                 # Integration documentation
${questionnaire.integrations.map(i => `│   ├── ${i.service.toLowerCase()}.shep     # ${i.service} integration`).join('\n')}
├── config/                       # App configuration
│   └── app.shep                  # Main app config
├── README.md                     # This file
└── NEXT_STEPS.md                 # Development guide
\`\`\`

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- ShepLang CLI (install via \`npm install -g sheplang\`)

### Commands

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Validate ShepLang syntax
npm run validate

# Generate code from ShepLang
npm run generate
\`\`\`

### Environment Variables

Create a \`.env\` file with the following variables:

${this.generateEnvVariables(questionnaire)}

## 🔐 Authentication

${this.generateAuthenticationSection(questionnaire)}

## 🔌 Integrations

${questionnaire.integrations.length > 0 
  ? questionnaire.integrations.map(i => 
    `### ${i.service}\n${this.getIntegrationDescription(i.service)}`
  ).join('\n\n')
  : 'No external integrations configured.'
}

## 📊 API Documentation

The application exposes the following API endpoints:

### Auth Endpoints
- \`POST /auth/register\` - Register new user
- \`POST /auth/login\` - User login
- \`POST /auth/logout\` - User logout

### Entity Endpoints
${entities.map(entity => `
#### ${entity.name}
- \`GET /${entity.name.toLowerCase()}\` - List all ${entity.name.toLowerCase()}s
- \`GET /${entity.name.toLowerCase()}/:id\` - Get ${entity.name.toLowerCase()} details
- \`POST /${entity.name.toLowerCase()}\` - Create ${entity.name.toLowerCase()}
- \`PUT /${entity.name.toLowerCase()}/:id\` - Update ${entity.name.toLowerCase()}
- \`DELETE /${entity.name.toLowerCase()}/:id\` - Delete ${entity.name.toLowerCase()}
`).join('')}

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "Authentication"

# Run tests with coverage
npm run test:coverage
\`\`\`

## 🚀 Deployment

### Development
\`\`\`bash
npm run dev
\`\`\`

### Production
\`\`\`bash
npm run build
npm start
\`\`\`

### Deploy to ${questionnaire.deployment}
${this.getDeploymentInstructions(questionnaire.deployment)}

## 📚 Learn More

- [ShepLang Documentation](https://sheplang.dev/docs)
- [ShepLang Examples](https://sheplang.dev/examples)
- [Community Discord](https://discord.gg/sheplang)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@sheplang.dev
- 💬 Discord: [Join our community](https://discord.gg/sheplang)
- 📖 Docs: [sheplang.dev/docs](https://sheplang.dev/docs)

---

*Generated with ❤️ by ShepLang Wizard on ${new Date().toLocaleDateString()}*
`;
  }

  /**
   * Generate entities README
   */
  public generateEntitiesReadme(questionnaire: ProjectQuestionnaire): string {
    return `# Entities

This folder contains all data models for ${questionnaire.projectName}.

## What are Entities?

Entities define the data structure of your application. Each entity represents a table in your database and includes:

- **Fields**: Data columns with types and validation
- **Relationships**: Connections to other entities
- **Background Jobs**: Automated processes
- **CRUD Operations**: Create, Read, Update, Delete actions

## Available Entities

${questionnaire.entities.map(entity => `
### ${entity.name}

**Description**: ${this.getEntityDescription(entity)}

**Fields**:
${entity.fields.map(field => 
  `- \`${field.name}\`: ${field.type}${field.required ? ' (required)' : ''}`
).join('\n')}

**Generated Actions**:
- \`create${entity.name}()\` - Create new ${entity.name.toLowerCase()}
- \`view${entityName}(id)\` - View ${entity.name.toLowerCase()} details
- \`update${entityName}(id, ...)\` - Update ${entity.name.toLowerCase()}
- \`delete${entityName}(id)\` - Delete ${entity.name.toLowerCase()}

**Usage Example**:
\`\`\`sheplang
# Create a new ${entity.name.toLowerCase()}
action createMy${entity.name}():
  ${entity.fields.filter(f => f.required).map(f => f.name).join(', ')} = getUserInput()
  call create${entity.name}(${entity.fields.filter(f => f.required).map(f => f.name).join(', ')})
  show ${entity.name}List
\`\`\`
`).join('\n')}

## Adding New Entities

1. Create a new \`.shep\` file in this folder
2. Define your entity with the \`data\` keyword
3. Add fields with appropriate types
4. Include any relationships or background jobs
5. Run \`npm run validate\` to check syntax

## Best Practices

- Use descriptive names for entities and fields
- Always include required fields
- Add background jobs for common operations
- Include validation rules where needed
- Document complex relationships

## Generated Files

${questionnaire.entities.map(e => `- \`${e.name}.shep\` - ${e.name} entity definition`).join('\n')}
`;
  }

  /**
   * Generate flows README
   */
  public generateFlowsReadme(questionnaire: ProjectQuestionnaire): string {
    return `# Flows

This folder contains all business logic flows for ${questionnaire.projectName}.

## What are Flows?

Flows define multi-step business processes in your application. Each flow contains:

- **Steps**: Sequential actions to execute
- **Conditions**: Logic for branching and decision making
- **Error Handling**: Recovery paths for failures
- **Success/Failure Paths**: Different outcomes based on execution

## Available Flows

### Authentication Flow
**Location**: \`flows/auth/authentication.shep\`

Handles user registration, login, and session management:
- User registration with email verification
- Login and session validation
- Role assignment (if multi-role)
- Logout and session cleanup

### Feature Flows
${questionnaire.features.map(feature => `
#### ${feature.name}
**Location**: \`flows/${this.sanitizeFolderName(feature.name)}/${this.sanitizeFolderName(feature.name)}.shep\`

${this.getFlowDescription(feature)}
`).join('')}

### Integration Flows
${questionnaire.integrations.length > 0 ? `
#### Webhook Integrations
**Location**: \`flows/webhooks/integrations.shep\`

Handles incoming webhooks from external services:
- Parse and validate webhook payloads
- Process integration-specific events
- Update database based on webhook data
- Send appropriate responses
` : ''}

## Flow Structure

Each flow follows this pattern:

\`\`\`sheplang
flow FlowName:
  steps:
    step stepName:
      action: actionName(parameters)
      success: nextStep
      failure: errorStep
    
    step nextStep:
      # ... continue flow
      
    step errorStep:
      # ... handle error
\`\`\`

## Adding New Flows

1. Create a new folder in \`flows/\`
2. Create a \`.shep\` file with your flow definition
3. Define steps with actions and transitions
4. Include error handling for each step
5. Test the flow with \`npm run validate\`

## Best Practices

- Keep flows focused on single business processes
- Always include error handling
- Use descriptive step names
- Document complex business logic
- Test flows independently

## Generated Files

- \`flows/auth/authentication.shep\` - Authentication flow
${questionnaire.features.map(f => `- \`flows/${this.sanitizeFolderName(f.name)}/${this.sanitizeFolderName(f.name)}.shep\` - ${f.name} flow`).join('\n')}
${questionnaire.integrations.length > 0 ? '- \`flows/webhooks/integrations.shep\` - Webhook handling flow' : ''}
`;
  }

  /**
   * Generate screens README
   */
  public generateScreensReadme(questionnaire: ProjectQuestionnaire): string {
    return `# Screens

This folder contains all UI screens for ${questionnaire.projectName}.

## What are Screens?

Screens define the user interface of your application. Each screen contains:

- **Layout**: Structure and organization
- **Components**: UI elements and widgets
- **Data Loading**: How to fetch and display data
- **User Actions**: Buttons, forms, and interactions
- **Real-time Updates**: Live data if enabled

## Available Screens

### Dashboard
**Location**: \`screens/dashboard/main.shep\`

Main application dashboard featuring:
- Key metrics and KPIs
- Recent activity feed
- Quick action buttons
- Real-time updates${questionnaire.realtime ? ' (enabled)' : ''}

### Entity Screens
${questionnaire.entities.map(entity => `
#### ${entity.name} Screens
**Location**: \`screens/${entity.name.toLowerCase()}/\`

- \`list.shep\` - ${entity.name} list with search and filtering
- \`detail.shep\` - ${entity.name} detail view with actions
- \`form.shep\` - Create/edit ${entity.name.toLowerCase()} form

Features:
- Paginated lists
- Search and filter capabilities
- CRUD operations
- Responsive design
`).join('')}

## Screen Structure

Each screen follows this pattern:

\`\`\`sheplang
view ScreenName:
  header: "Screen Title"
  subtitle: "Screen description"
  
  section sectionName:
    # UI components and data
    
  action actionName():
    # Screen actions
\`\`\`

## Adding New Screens

1. Create a new folder in \`screens/\`
2. Create \`.shep\` files for different views
3. Define layout with sections and components
4. Add data loading and user actions
5. Include real-time updates if needed
6. Test with \`npm run validate\`

## UI Components

### Common Components
- **Cards**: Display information with actions
- **Lists**: Show collections of items
- **Forms**: Collect user input
- **Buttons**: Trigger actions
- **Inputs**: Text, number, date, file inputs

### Data Display
- **Fields**: Show individual data points
- **Tables**: Display tabular data
- **Charts**: Visualize metrics
- **Images**: Display media content

## Best Practices

- Keep screens focused on single purposes
- Use consistent layouts and styling
- Include loading states for data
- Add error handling for failed requests
- Design for mobile and desktop
- Test screen interactions thoroughly

## Generated Files

- \`screens/dashboard/main.shep\` - Main dashboard
${questionnaire.entities.map(e => `- \`screens/${e.name.toLowerCase()}/list.shep\` - ${e.name} list screen\n- \`screens/${e.name.toLowerCase()}/detail.shep\` - ${e.name} detail screen\n- \`screens/${e.name.toLowerCase()}/form.shep\` - ${e.name} form screen`).join('\n')}
`;
  }

  /**
   * Generate integrations README
   */
  public generateIntegrationsReadme(questionnaire: ProjectQuestionnaire): string {
    return `# Integrations

This folder contains all external service integrations for ${questionnaire.projectName}.

## What are Integrations?

Integrations connect your application to external services like payment processors, email providers, and authentication systems. Each integration includes:

- **Configuration**: API keys and settings
- **Actions**: Methods to interact with the service
- **Webhooks**: Handle incoming events
- **Error Handling**: Retry logic and fallbacks

## Configured Integrations

${questionnaire.integrations.length > 0 
  ? questionnaire.integrations.map(integration => `
### ${integration.service}
**File**: \`${integration.service.toLowerCase()}.shep\`

**Category**: ${integration.category}

**Features**:
${this.getIntegrationFeatures(integration.service)}

**Setup**:
${this.getIntegrationSetup(integration.service)}

**Usage Example**:
\`\`\`sheplang
# ${this.getIntegrationExample(integration.service)}
\`\`\`
`).join('\n')
  : 'No external integrations configured yet.'
}

## Adding New Integrations

1. Create a new \`.shep\` file in this folder
2. Define integration with configuration
3. Add actions for the service API
4. Include webhook handlers if needed
5. Add error handling and retry logic
6. Test with \`npm run validate\`

## Integration Template

\`\`\`sheplang
integration ServiceName:
  config:
    apiKey: env.SERVICE_API_KEY
    # Add other config variables
  
  action doSomething(data):
    call ServiceName.method with data
    return result
\`\`\`

## Best Practices

- Store API keys in environment variables
- Include proper error handling
- Add retry logic for network requests
- Validate webhook signatures
- Monitor integration health
- Document rate limits and quotas

## Security Considerations

- Never commit API keys to version control
- Use HTTPS for all API calls
- Validate all incoming data
- Implement rate limiting
- Monitor for suspicious activity
- Keep dependencies updated

## Generated Files

${questionnaire.integrations.map(i => `- \`${i.service.toLowerCase()}.shep\` - ${i.service} integration`).join('\n')}
`;
  }

  /**
   * Generate NEXT_STEPS.md
   */
  public generateNextSteps(questionnaire: ProjectQuestionnaire): string {
    return `# Next Steps for ${questionnaire.projectName}

Welcome! Your ShepLang project has been generated successfully. Here's what to do next:

## 🎯 Immediate Actions (Today)

### 1. Set Up Environment
\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# Required for your integrations:
${this.getRequiredEnvVars(questionnaire)}
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Start Development
\`\`\`bash
npm run dev
\`\`\`

Open \`http://localhost:3000\` to see your app!

## 📋 This Week

### Day 1-2: Customize Your Data
${questionnaire.entities.map(entity => `
- **${entity.name}**: Edit \`entities/${entity.name}.shep\`
  - Add custom fields
  - Define validation rules
  - Set up relationships
`).join('')}

### Day 3-4: Implement Your Features
${questionnaire.features.map(feature => `
- **${feature.name}**: Work in \`flows/${this.sanitizeFolderName(feature.name)}/\`
  - Customize business logic
  - Add error handling
  - Test the flow
`).join('')}

### Day 5: Set Up Integrations
${questionnaire.integrations.map(integration => `
- **${integration.service}**: Configure \`integrations/${integration.service.toLowerCase()}.shep\`
  - Add API keys to \`.env\`
  - Test webhook endpoints
  - Customize actions
`).join('')}

## 🚀 This Month

### Week 1: Core Functionality
- [ ] Complete all CRUD operations
- [ ] Implement authentication flow
- [ ] Set up database schema
- [ ] Add basic validation

### Week 2: UI/UX Polish
- [ ] Customize screen layouts
- [ ] Add loading states
- [ ] Implement error pages
- [ ] Mobile responsiveness

### Week 3: Advanced Features
- [ ] Add real-time updates${questionnaire.realtime ? ' (already enabled!)' : ''}
- [ ] Implement file uploads
- [ ] Add search functionality
- [ ] Set up monitoring

### Week 4: Testing & Deployment
- [ ] Write comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to staging
- [ ] Production deployment

## 🛠️ Development Workflow

### Daily Commands
\`\`\`bash
# Validate ShepLang syntax
npm run validate

# Generate code from ShepLang
npm run generate

# Run tests
npm test

# Check code quality
npm run lint
\`\`\`

### Git Workflow
\`\`\`bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
\`\`\`

## 📚 Learning Resources

### ShepLang Basics
- [Official Documentation](https://sheplang.dev/docs)
- [Interactive Tutorial](https://sheplang.dev/tutorial)
- [Example Projects](https://sheplang.dev/examples)

### Advanced Topics
- [Real-time Features](https://sheplang.dev/docs/realtime)
- [Authentication Guide](https://sheplang.dev/docs/auth)
- [Integration Patterns](https://sheplang.dev/docs/integrations)

## 🆘 Getting Help

### Common Issues
- **Build errors**: Check \`npm run validate\` for syntax issues
- **API failures**: Verify environment variables in \`.env\`
- **Database errors**: Ensure database is running and accessible

### Support Channels
- 📧 Email: support@sheplang.dev
- 💬 Discord: [Join our community](https://discord.gg/sheplang)
- 📖 Docs: [sheplang.dev/docs](https://sheplang.dev/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/sheplang/sheplang/issues)

## 🎉 Milestones

### MVP (2 weeks)
- [ ] All basic CRUD working
- [ ] User authentication
- [ ] Core features implemented
- [ ] Deployed to staging

### Beta (4 weeks)
- [ ] Full feature set
- [ ] Integration testing
- [ ] Performance optimization
- [ ] User feedback collection

### Production (6 weeks)
- [ ] Production deployment
- [ ] Monitoring and analytics
- [ ] Documentation complete
- [ ] Team training

## 📈 Pro Tips

### Development
- Use \`npm run validate\` frequently to catch syntax errors early
- Test each entity/flow independently before integrating
- Keep your Shepang files focused and modular
- Use descriptive names for better maintainability

### Deployment
- Always test in staging before production
- Use environment-specific configurations
- Monitor your integrations for rate limits
- Keep backup of your database schema

### Performance
- Optimize database queries early
- Implement caching where appropriate
- Monitor API response times
- Use lazy loading for large datasets

---

Happy coding! 🚀

*Generated with ❤️ by ShepLang Wizard*
`;
  }

  /**
   * Helper methods
   */
  private getProjectTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'mobile-first': 'A mobile-first application',
      'saas-dashboard': 'A SaaS dashboard application',
      'ecommerce': 'An e-commerce store',
      'content-platform': 'A content platform',
      'custom': 'A custom application'
    };
    return descriptions[type] || 'A ShepLang application';
  }

  private sanitizeFolderName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateEnvVariables(questionnaire: ProjectQuestionnaire): string {
    const vars: string[] = [
      '# Database',
      'DATABASE_URL="postgresql://user:password@localhost:5432/dbname"',
      '',
      '# Application',
      'APP_URL="http://localhost:3000"',
      'JWT_SECRET="your-jwt-secret"',
      '',
      '# Email',
      'SMTP_HOST="smtp.gmail.com"',
      'SMTP_PORT="587"',
      'SMTP_USER="your-email@gmail.com"',
      'SMTP_PASS="your-app-password"'
    ];

    if (questionnaire.integrations.some(i => i.service === 'Stripe')) {
      vars.push('', '# Stripe', 'STRIPE_API_KEY="sk_test_..."', 'STRIPE_WEBHOOK_SECRET="whsec_..."');
    }

    if (questionnaire.integrations.some(i => i.service === 'SendGrid')) {
      vars.push('', '# SendGrid', 'SENDGRID_API_KEY="SG.xxx..."');
    }

    if (questionnaire.integrations.some(i => i.service === 'AWS S3')) {
      vars.push('', '# AWS S3', 'AWS_ACCESS_KEY_ID="AKIA..."', 'AWS_SECRET_ACCESS_KEY="..."', 'AWS_REGION="us-east-1"', 'S3_BUCKET_NAME="your-bucket"');
    }

    if (questionnaire.integrations.some(i => i.service === 'Clerk')) {
      vars.push('', '# Clerk', 'CLERK_API_KEY="sk_test_..."', 'CLERK_JWT_KEY="..."', 'CLERK_FRONTEND_API="clerk.your-app.dev"');
    }

    return vars.join('\n');
  }

  private generateAuthenticationSection(questionnaire: ProjectQuestionnaire): string {
    switch (questionnaire.roleType) {
      case 'single-user':
        return 'Simple authentication with email/password login.';
      case 'multiple-roles':
        return 'Role-based authentication with Admin and User roles.';
      case 'team-based':
        return 'Team-based authentication with organizations and workspaces.';
      default:
        return 'Email/password authentication system.';
    }
  }

  private getIntegrationDescription(service: string): string {
    const descriptions: Record<string, string> = {
      'Stripe': 'Payment processing and subscription management',
      'PayPal': 'Alternative payment processing',
      'SendGrid': 'Email delivery and templates',
      'Resend': 'Modern email API',
      'AWS S3': 'File storage and CDN',
      'Cloudinary': 'Image optimization and delivery',
      'Clerk': 'User authentication and management',
      'Auth0': 'Alternative authentication provider'
    };
    return descriptions[service] || 'External service integration';
  }

  private getIntegrationFeatures(service: string): string {
    const features: Record<string, string> = {
      'Stripe': '- Payment processing\n- Subscription management\n- Webhook handling\n- Customer management',
      'SendGrid': '- Email templates\n- Bulk sending\n- Analytics tracking\n- Webhook events',
      'AWS S3': '- File uploads\n- Image processing\n- CDN delivery\n- Backup storage',
      'Clerk': '- User authentication\n- Session management\n- Organization support\n- Social login'
    };
    return features[service] || '- Basic API integration\n- Error handling\n- Configuration management';
  }

  private getIntegrationSetup(service: string): string {
    const setups: Record<string, string> = {
      'Stripe': '1. Create Stripe account\n2. Get API keys from dashboard\n3. Configure webhook endpoints\n4. Add STRIPE_API_KEY to .env',
      'SendGrid': '1. Create SendGrid account\n2. Verify sender domain\n3. Create email templates\n4. Add SENDGRID_API_KEY to .env',
      'AWS S3': '1. Create S3 bucket\n2. Configure CORS policy\n3. Set up CloudFront CDN\n4. Add AWS credentials to .env',
      'Clerk': '1. Create Clerk application\n2. Configure authentication methods\n3. Set up webhook URLs\n4. Add Clerk keys to .env'
    };
    return setups[service] || '1. Create service account\n2. Get API credentials\n3. Configure webhooks\n4. Add API keys to .env';
  }

  private getIntegrationExample(service: string): string {
    const examples: Record<string, string> = {
      'Stripe': 'Process payment\naction processPayment(amount):\n  payment = createPayment(amount)\n  if payment.success:\n    show OrderConfirmation\n  else:\n    show PaymentError',
      'SendGrid': 'Send welcome email\naction welcomeUser(email, name):\n  sendWelcomeEmail(email, name)',
      'AWS S3': 'Upload file\naction uploadUserFile(file):\n  result = uploadFile(file, "user-uploads")\n  return result.url'
    };
    return examples[service] || `# Use ${service} integration\naction useService(data):\n  result = call ${service}.method with data\n  return result`;
  }

  private getRequiredEnvVars(questionnaire: ProjectQuestionnaire): string {
    const vars: string[] = [];
    
    questionnaire.integrations.forEach(integration => {
      switch (integration.service) {
        case 'Stripe':
          vars.push('- STRIPE_API_KEY: Your Stripe secret key');
          break;
        case 'SendGrid':
          vars.push('- SENDGRID_API_KEY: Your SendGrid API key');
          break;
        case 'AWS S3':
          vars.push('- AWS_ACCESS_KEY_ID: AWS access key');
          vars.push('- AWS_SECRET_ACCESS_KEY: AWS secret key');
          vars.push('- S3_BUCKET_NAME: Your S3 bucket name');
          break;
        case 'Clerk':
          vars.push('- CLERK_API_KEY: Clerk API key');
          vars.push('- CLERK_JWT_KEY: Clerk JWT key');
          break;
      }
    });

    return vars.length > 0 ? vars.join('\n') : '- No additional environment variables required';
  }

  private getDeploymentInstructions(platform: string): string {
    const instructions: Record<string, string> = {
      'Vercel': `\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\``,
      'Netlify': `\`\`\`bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
\`\`\``,
      'AWS': `\`\`\`bash
# Use AWS Amplify or ECS
# See deployment guide for details
\`\`\``,
      'Docker': `\`\`\`bash
# Build image
docker build -t my-app .

# Run container
docker run -p 3000:3000 my-app
\`\`\``
    };
    return instructions[platform] || instructions['Vercel'];
  }

  private getEntityDescription(entity: EntityDefinition): string {
    const name = entity.name.toLowerCase();
    
    if (name.includes('user')) return 'User account and profile information';
    if (name.includes('order')) return 'Customer orders and purchase history';
    if (name.includes('product')) return 'Product catalog and inventory';
    if (name.includes('post')) return 'Blog posts and content';
    if (name.includes('team')) return 'Team organization and membership';
    
    return `${entity.name} data model`;
  }

  private getFlowDescription(feature: ProjectFeature): string {
    return `Business logic for ${feature.name.toLowerCase()} functionality`;
  }
}
