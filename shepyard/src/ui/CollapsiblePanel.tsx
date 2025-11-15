/**
 * CollapsiblePanel Component
 * 
 * Accessible collapsible panel using HTML <details> element.
 * Based on MDN official documentation for details/summary elements.
 * 
 * References:
 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
 * - https://react.dev/learn/sharing-state-between-components
 * 
 * Phase 3: Explain Panel
 */

import { ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: ReactNode;
  icon?: string;
  className?: string;
}

/**
 * Accessible collapsible panel component
 * 
 * Uses native HTML <details> element for:
 * - Built-in accessibility (keyboard navigation, screen readers)
 * - No JavaScript required for basic functionality
 * - Semantic HTML structure
 * 
 * @example
 * ```tsx
 * <CollapsiblePanel title="Explain" icon="💡">
 *   <p>Panel content here</p>
 * </CollapsiblePanel>
 * ```
 */
export function CollapsiblePanel({
  title,
  defaultOpen = false,
  onToggle,
  children,
  icon,
  className = '',
}: CollapsiblePanelProps) {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const isOpen = event.currentTarget.open;
    onToggle?.(isOpen);
  };

  return (
    <details
      className={`collapsible-panel border-b border-vscode-border ${className}`}
      open={defaultOpen}
      onToggle={handleToggle}
      data-testid="collapsible-panel"
    >
      <summary className="cursor-pointer select-none flex items-center justify-between px-4 py-3 bg-vscode-activityBar border-b border-vscode-border hover:bg-vscode-hover transition-colors">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
          <span className="font-semibold text-vscode-fg">{title}</span>
        </div>
        <span className="text-gray-400 text-sm" aria-hidden="true">
          {defaultOpen ? '▼' : '▶'}
        </span>
      </summary>

      {/* Panel content */}
      <div className="px-4 py-3 bg-vscode-bg">
        {children}
      </div>

      {/* CSS for collapsible behavior */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Rotate chevron when details is open */
        details[open] .details-chevron {
          transform: rotate(180deg);
        }

        /* Remove default marker/triangle */
        summary {
          list-style: none;
        }
        
        summary::-webkit-details-marker {
          display: none;
        }

        /* Smooth transitions */
        .details-chevron {
          transition: transform 0.2s ease-in-out;
        }
      `}} />
    </details>
  );
}

/**
 * Collapsible Panel Group
 * 
 * Groups multiple panels with optional "accordion" behavior
 * (only one panel open at a time)
 */
interface CollapsiblePanelGroupProps {
  children: ReactNode;
  accordion?: boolean;
  className?: string;
}

export function CollapsiblePanelGroup({
  children,
  accordion = false,
  className = '',
}: CollapsiblePanelGroupProps) {
  return (
    <div
      className={`collapsible-panel-group ${className}`}
      data-accordion={accordion}
    >
      {children}
    </div>
  );
}
