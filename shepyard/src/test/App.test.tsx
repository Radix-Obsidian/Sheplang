/**
 * ShepYard Phase 1 Tests
 * 
 * Tests for example selection and code viewer functionality.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamplesSidebar } from '../ui/ExamplesSidebar';
import { ShepCodeViewer } from '../editor/ShepCodeViewer';
import { SHEP_EXAMPLES } from '../examples/exampleList';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';

describe('ShepYard Phase 1: Examples + Read-only Viewer', () => {
  it('renders examples sidebar with all examples', () => {
    render(<ExamplesSidebar />);
    
    // Check that all examples are rendered
    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('Dog Care Reminder')).toBeInTheDocument();
    expect(screen.getByText('Multi-Screen Navigation')).toBeInTheDocument();
  });

  it('selects an example when clicked', () => {
    render(<ExamplesSidebar />);
    
    const todoButton = screen.getByTestId('example-todo');
    fireEvent.click(todoButton);
    
    // Verify the store was updated
    const activeExampleId = useWorkspaceStore.getState().activeExampleId;
    expect(activeExampleId).toBe('todo');
  });

  it('displays selected example with active styling', () => {
    // Pre-select an example
    useWorkspaceStore.getState().setActiveExample('dog-reminder');
    
    render(<ExamplesSidebar />);
    
    const dogButton = screen.getByTestId('example-dog-reminder');
    expect(dogButton).toHaveClass('bg-indigo-50', 'border-indigo-500');
  });

  it('renders code viewer with source text', () => {
    const todoExample = SHEP_EXAMPLES.find((ex) => ex.id === 'todo')!;
    
    render(<ShepCodeViewer source={todoExample.source} />);
    
    const viewer = screen.getByTestId('shep-code-viewer');
    expect(viewer).toBeInTheDocument();
  });

  it('clears active example', () => {
    useWorkspaceStore.getState().setActiveExample('todo');
    expect(useWorkspaceStore.getState().activeExampleId).toBe('todo');
    
    useWorkspaceStore.getState().clearActiveExample();
    expect(useWorkspaceStore.getState().activeExampleId).toBeNull();
  });
});
