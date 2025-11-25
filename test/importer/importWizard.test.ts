/**
 * Slice 6 Tests – Import Wizard Integration
 * 
 * Tests the analysis aggregator and wizard choice handling:
 * - Aggregating parser outputs
 * - Applying wizard choices to analysis
 * - Filtering and renaming items
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  aggregateAnalysis,
  resetIdCounter,
  getAnalysisSummary,
  filterEnabledItems,
  createEmptyAnalysis
} from '../../extension/src/services/importAnalysisAggregator';
import {
  applyWizardChoices,
  getConfidenceClass,
  formatConfidence,
  ImportAnalysis,
  WizardChoices,
  DetectedItem
} from '../../extension/src/types/ImportWizard';
import { Entity } from '../../extension/src/types/Entity';
import { ReactComponent } from '../../extension/src/parsers/reactParser';
import { ProjectMapping, ShepLangView, ShepLangAction } from '../../extension/src/types/ViewAction';
import { APIRouteParseResult, APIRoute } from '../../extension/src/types/APIRoute';

describe('Import Wizard – Slice 6', () => {
  // Reset ID counter before each test
  beforeEach(() => {
    resetIdCounter();
  });

  // Sample test data
  const sampleEntities: Entity[] = [
    {
      name: 'Task',
      fields: [
        { name: 'id', type: 'number', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'completed', type: 'yes/no', required: true }
      ],
      relations: [],
      enums: []
    },
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'number', required: true },
        { name: 'email', type: 'text', required: true }
      ],
      relations: [],
      enums: []
    }
  ];

  const sampleComponents: ReactComponent[] = [
    {
      name: 'TaskList',
      filePath: 'app/components/TaskList.tsx',
      type: 'component',
      exports: 'default',
      props: [],
      state: [],
      elements: [],
      handlers: [],
      apiCalls: []
    }
  ];

  const sampleProjectMapping: ProjectMapping = {
    views: [
      {
        name: 'TaskList',
        kind: 'component',
        widgets: [{ type: 'list' }, { type: 'button', label: 'Add' }],
        bindings: [{ variable: 'tasks', entity: 'Task', type: 'list' }],
        props: []
      }
    ],
    actions: [
      {
        name: 'AddTask',
        trigger: 'click',
        params: [],
        operations: [{ kind: 'call', endpoint: '/api/tasks', method: 'POST' }]
      }
    ],
    entities: ['Task'],
    confidence: 0.8,
    warnings: []
  };

  const sampleRoutes: APIRouteParseResult = {
    routes: [
      {
        path: '/api/tasks',
        method: 'GET',
        filePath: 'app/api/tasks/route.ts',
        handlerName: 'GET',
        params: [],
        prismaOperation: 'findMany',
        prismaModel: 'task',
        bodyFields: [],
        returnsJson: true
      },
      {
        path: '/api/tasks',
        method: 'POST',
        filePath: 'app/api/tasks/route.ts',
        handlerName: 'POST',
        params: [],
        prismaOperation: 'create',
        prismaModel: 'task',
        bodyFields: ['title'],
        returnsJson: true
      }
    ],
    errors: [],
    warnings: []
  };

  describe('aggregateAnalysis', () => {
    it('aggregates all parser results correctly', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      expect(analysis.projectName).toBe('TestProject');
      expect(analysis.entities).toHaveLength(2);
      expect(analysis.views).toHaveLength(1);
      expect(analysis.actions).toHaveLength(1);
      expect(analysis.routes).toHaveLength(2);
    });

    it('assigns unique IDs to all items', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const allIds = [
        ...analysis.entities.map(e => e.id),
        ...analysis.views.map(v => v.id),
        ...analysis.actions.map(a => a.id),
        ...analysis.routes.map(r => r.id)
      ];

      // All IDs should be unique
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('calculates overall confidence', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('sets all items enabled by default', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const allItems = [
        ...analysis.entities,
        ...analysis.views,
        ...analysis.actions,
        ...analysis.routes
      ];

      expect(allItems.every(item => item.enabled)).toBe(true);
    });

    it('includes entity field details', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const taskEntity = analysis.entities.find(e => e.originalName === 'Task');
      expect(taskEntity).toBeDefined();
      expect(taskEntity!.details.kind).toBe('entity');
      
      if (taskEntity!.details.kind === 'entity') {
        expect(taskEntity!.details.fields).toHaveLength(3);
        expect(taskEntity!.details.fields.map(f => f.name)).toContain('title');
      }
    });

    it('includes route Prisma operation details', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const getRoute = analysis.routes.find(r => 
        r.originalName.includes('GET')
      );
      expect(getRoute).toBeDefined();
      
      if (getRoute!.details.kind === 'route') {
        expect(getRoute!.details.prismaOperation).toBe('findMany');
        expect(getRoute!.details.prismaModel).toBe('task');
      }
    });
  });

  describe('applyWizardChoices', () => {
    it('filters disabled items', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      // Disable the second entity
      const choices: WizardChoices = {
        items: {
          [analysis.entities[1].id]: { enabled: false }
        },
        generateBackend: true
      };

      const result = applyWizardChoices(analysis, choices);

      // Should only have 1 entity (User disabled)
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Task');
    });

    it('applies renamed items', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const taskId = analysis.entities.find(e => e.originalName === 'Task')!.id;

      const choices: WizardChoices = {
        items: {
          [taskId]: { enabled: true, renamedTo: 'TodoItem' }
        },
        generateBackend: true
      };

      const result = applyWizardChoices(analysis, choices);

      const renamedEntity = result.entities.find(e => e.original === 'Task');
      expect(renamedEntity).toBeDefined();
      expect(renamedEntity!.name).toBe('TodoItem');
    });

    it('preserves original name reference', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const viewId = analysis.views[0].id;

      const choices: WizardChoices = {
        items: {
          [viewId]: { enabled: true, renamedTo: 'TaskManager' }
        },
        generateBackend: true
      };

      const result = applyWizardChoices(analysis, choices);

      expect(result.views[0].name).toBe('TaskManager');
      expect(result.views[0].original).toBe('TaskList');
    });

    it('uses appName override', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const choices: WizardChoices = {
        items: {},
        appName: 'MyCustomApp',
        generateBackend: true
      };

      const result = applyWizardChoices(analysis, choices);
      expect(result.appName).toBe('MyCustomApp');
    });

    it('respects generateBackend flag', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const choices: WizardChoices = {
        items: {},
        generateBackend: false
      };

      const result = applyWizardChoices(analysis, choices);
      expect(result.generateBackend).toBe(false);
    });
  });

  describe('utility functions', () => {
    it('getConfidenceClass returns correct class', () => {
      expect(getConfidenceClass(0.9)).toBe('high');
      expect(getConfidenceClass(0.8)).toBe('high');
      expect(getConfidenceClass(0.7)).toBe('medium');
      expect(getConfidenceClass(0.6)).toBe('medium');
      expect(getConfidenceClass(0.5)).toBe('low');
      expect(getConfidenceClass(0.3)).toBe('low');
    });

    it('formatConfidence returns percentage string', () => {
      expect(formatConfidence(0.95)).toBe('95%');
      expect(formatConfidence(0.8)).toBe('80%');
      expect(formatConfidence(0.333)).toBe('33%');
      expect(formatConfidence(1)).toBe('100%');
      expect(formatConfidence(0)).toBe('0%');
    });

    it('getAnalysisSummary returns correct counts', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      const summary = getAnalysisSummary(analysis);

      expect(summary.entities).toBe(2);
      expect(summary.views).toBe(1);
      expect(summary.actions).toBe(1);
      expect(summary.routes).toBe(2);
      expect(summary.totalItems).toBe(6);
      expect(summary.enabledItems).toBe(6);
    });

    it('filterEnabledItems removes disabled items', () => {
      const analysis = aggregateAnalysis(
        'TestProject',
        '/test/path',
        sampleEntities,
        sampleComponents,
        sampleProjectMapping,
        sampleRoutes
      );

      // Disable an entity manually
      analysis.entities[0].enabled = false;

      const filtered = filterEnabledItems(analysis);

      expect(filtered.entities).toHaveLength(1);
      expect(filtered.entities[0].originalName).toBe('User');
    });

    it('createEmptyAnalysis creates valid empty structure', () => {
      const empty = createEmptyAnalysis('EmptyProject', '/empty/path');

      expect(empty.projectName).toBe('EmptyProject');
      expect(empty.entities).toHaveLength(0);
      expect(empty.views).toHaveLength(0);
      expect(empty.actions).toHaveLength(0);
      expect(empty.routes).toHaveLength(0);
      expect(empty.confidence).toBe(0);
      expect(empty.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('integration with parsers', () => {
    it('handles empty parser results gracefully', () => {
      const analysis = aggregateAnalysis(
        'EmptyProject',
        '/test/path',
        [],
        [],
        { views: [], actions: [], entities: [], confidence: 0, warnings: [] },
        { routes: [], errors: [], warnings: ['No API routes found'] }
      );

      expect(analysis.entities).toHaveLength(0);
      expect(analysis.views).toHaveLength(0);
      expect(analysis.actions).toHaveLength(0);
      expect(analysis.routes).toHaveLength(0);
      expect(analysis.warnings).toContain('No API routes found');
    });
  });
});
