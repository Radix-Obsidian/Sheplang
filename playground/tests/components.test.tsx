/**
 * Component Tests
 * Tests React components import correctly
 */

import { describe, it, expect } from 'vitest';

describe('Component Imports', () => {
  it('should import examples gallery without errors', async () => {
    const { default: ExamplesGallery } = await import('../components/Examples/ExamplesGallery');
    expect(ExamplesGallery).toBeDefined();
    expect(typeof ExamplesGallery).toBe('function');
  });

  it('should import header component', async () => {
    const { default: Header } = await import('../components/Layout/Header');
    expect(Header).toBeDefined();
    expect(typeof Header).toBe('function');
  });

  it('should import code viewer components', async () => {
    const { GeneratedCodeViewer } = await import('../components/CodeViewer/GeneratedCodeViewer');
    const { FileTree } = await import('../components/CodeViewer/FileTree');
    const { CodeDisplay } = await import('../components/CodeViewer/CodeDisplay');
    const { MetricsPanel } = await import('../components/CodeViewer/MetricsPanel');
    
    expect(GeneratedCodeViewer).toBeDefined();
    expect(FileTree).toBeDefined();
    expect(CodeDisplay).toBeDefined();
    expect(MetricsPanel).toBeDefined();
  });
});
