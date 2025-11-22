// Phase II: State Machine Compiler Templates
// Based on official Prisma and TypeScript patterns

export const templateStateMachineEnum = `
{{#each models}}
{{#if status}}
enum {{pascalCase name}}Status {
  {{#each status.states}}
  {{upperCase this}}
  {{/each}}
}
{{/if}}
{{/each}}
`;

export const templateStateMachinePrismaSchema = `
{{#each models}}
{{#if status}}
enum {{pascalCase name}}Status {
  {{#each status.states}}
  {{upperCase this}}
  {{/each}}
}

model {{pascalCase name}}StatusHistory {
  id        String      @id @default(uuid())
  {{camelCase name}}Id   String
  fromStatus {{pascalCase name}}Status?
  toStatus   {{pascalCase name}}Status
  event     String
  timestamp DateTime    @default(now())
  
  {{camelCase name}} {{pascalCase name}} @relation(fields: [{{camelCase name}}Id], references: [id])
  
  @@index([{{camelCase name}}Id, timestamp])
}
{{/if}}
{{/each}}
`;

export const templateStateTransitionAPI = `
// Generated state transition routes
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

{{#each models}}
{{#if status}}
// State transitions for {{pascalCase name}}
const {{upperCase name}}_TRANSITIONS = {
  {{#each status.transitions}}
  {{upperCase from}}: [{{#each ../status.transitions}}{{#if (eq from ../from)}}'{{upperCase to}}'{{#unless @last}}, {{/unless}}{{/if}}{{/each}}],
  {{/each}}
};

// POST /api/{{kebabCase name}}/:id/transition
router.post('/{{kebabCase name}}/:id/transition', async (req, res) => {
  const { {{camelCase name}}Id } = req.params;
  const { event, ...data } = req.body;
  
  try {
    const {{camelCase name}} = await prisma.{{camelCase name}}.findUnique({
      where: { id: {{camelCase name}}Id }
    });
    
    if (!{{camelCase name}}) {
      return res.status(404).json({ error: '{{pascalCase name}} not found' });
    }
    
    const newStatus = validateTransition({{camelCase name}}.status, event);
    
    if (!newStatus) {
      return res.status(400).json({ 
        error: 'Invalid transition: ' + event + ' from ' + {{camelCase name}}.status
      });
    }
    
    // Log state transition
    await prisma.{{camelCase name}}StatusHistory.create({
      data: {
        {{camelCase name}}Id,
        fromStatus: {{camelCase name}}.status,
        toStatus: newStatus,
        event
      }
    });
    
    // Update {{camelCase name}} status
    const updated{{pascalCase name}} = await prisma.{{camelCase name}}.update({
      where: { id: {{camelCase name}}Id },
      data: { status: newStatus }
    });
    
    res.json(updated{{pascalCase name}});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/{{kebabCase name}}/:id/transitions
router.get('/{{kebabCase name}}/:id/transitions', async (req, res) => {
  const { {{camelCase name}}Id } = req.params;
  
  try {
    const history = await prisma.{{camelCase name}}StatusHistory.findMany({
      where: { {{camelCase name}}Id },
      orderBy: { timestamp: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function validateTransition(currentStatus: string, event: string): string | null {
  const allowedStatuses = {{upperCase name}}_TRANSITIONS[currentStatus];
  
  // Event-to-status mapping (generated from workflow)
  const eventMapping: Record<string, string> = {
    {{#each ../workflows}}
    {{#each events}}
    {{#each actions}}
    '{{name}}': '{{upperCase target}}',
    {{/each}}
    {{/each}}
    {{/each}}
  };
  
  const targetStatus = eventMapping[event];
  
  if (targetStatus && allowedStatuses?.includes(targetStatus)) {
    return targetStatus;
  }
  
  return null;
}
{{/if}}
{{/each}}

export default router;
`;

export const templateStateManagementUI = `
// Generated state management components
import React, { useState } from 'react';

{{#each models}}
{{#if status}}
interface {{pascalCase name}}ActionsProps {
  {{camelCase name}}: {{pascalCase name}};
  onTransition: (event: string) => void;
}

export function {{pascalCase name}}Actions({ {{camelCase name}}, onTransition }: {{pascalCase name}}ActionsProps) {
  const availableActions = getAvailable{{pascalCase name}}Actions({{camelCase name}}.status);
  
  return (
    <div className="flex gap-2">
      {availableActions.map(action => (
        <button
          key={action.event}
          onClick={() => onTransition(action.event)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

interface {{pascalCase name}}StatusBadgeProps {
  status: {{pascalCase name}}Status;
}

export function {{pascalCase name}}StatusBadge({ status }: {{pascalCase name}}StatusBadgeProps) {
  const statusConfig = {
    {{#each status.states}}
    {{upperCase this}}: { color: '{{getStatusColor this}}', label: '{{pascalCase this}}' },
    {{/each}}
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={\`px-2 py-1 rounded text-sm bg-\${config.color}-100 text-\${config.color}-800\`}>
      {config.label}
    </span>
  );
}

function getAvailable{{pascalCase name}}Actions(status: {{pascalCase name}}Status) {
  const actionMap = {
    {{#each status.states}}
    {{upperCase this}}: [
      {{#each ../workflows}}
      {{#each events}}
      {{#if (eq state ../../this)}}
      {{#each actions}}
      { event: '{{name}}', label: '{{spacedCase name}}' },
      {{/each}}
      {{/if}}
      {{/each}}
      {{/each}}
    ],
    {{/each}}
  };
  
  return actionMap[status] || [];
}

interface {{pascalCase name}}StatusHistoryProps {
  {{camelCase name}}Id: string;
}

export function {{pascalCase name}}StatusHistory({ {{camelCase name}}Id }: {{pascalCase name}}StatusHistoryProps) {
  const [history, setHistory] = useState<{{pascalCase name}}StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  React.useEffect(() => {
    fetch('/api/{{kebabCase name}}/' + {{camelCase name}}Id + '/transitions')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load status history:', error);
        setLoading(false);
      });
  }, [{{camelCase name}}Id]);
  
  if (loading) {
    return <div className="animate-spin">Loading...</div>;
  }
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Status History</h3>
      {history.length === 0 ? (
        <p className="text-gray-500">No status changes yet</p>
      ) : (
        <div className="space-y-1">
          {history.map(entry => (
            <div key={entry.id} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span>→</span>
              <{{pascalCase name}}StatusBadge status={entry.toStatus} />
              <span className="text-gray-600">({entry.event})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
{{/if}}
{{/each}}
`;

export interface StateMachineCompilerContext {
  models: Array<{
    name: string;
    status?: {
      states: string[];
      transitions: Array<{
        from: string;
        to: string;
      }>;
    };
  }>;
  workflows?: Array<{
    name: string;
    events: Array<{
      state: string;
      actions: Array<{
        name: string;
        target: string;
      }>;
    }>;
  }>;
}

export function getStatusColor(status: string): string {
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
}

export function generateStateMachineCode(context: StateMachineCompilerContext) {
  // Process models with state machines
  const modelsWithStatus = context.models.filter(model => model.status);
  
  return {
    enums: templateStateMachineEnum,
    prismaSchema: templateStateMachinePrismaSchema,
    apiRoutes: templateStateTransitionAPI,
    uiComponents: templateStateManagementUI,
    models: modelsWithStatus
  };
}
