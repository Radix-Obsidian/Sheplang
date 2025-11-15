/**
 * ResizableLayout Component
 * 
 * Fully responsive panel system with drag-to-resize functionality.
 * Uses react-resizable-panels by Brian Vaughn (React core team).
 * 
 * Features:
 * - Horizontal drag resizing
 * - Collapsible left and right panels
 * - Auto-save panel sizes to localStorage
 * - Toggle buttons to show/hide panels
 * - Accessible keyboard navigation
 * 
 * References:
 * - https://github.com/bvaughn/react-resizable-panels
 */

import { useState, ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
  onLeftPanelToggle?: (isVisible: boolean) => void;
  onRightPanelToggle?: (isVisible: boolean) => void;
}

/**
 * Responsive three-panel layout with drag-to-resize
 * 
 * Layout structure:
 * ```
 * [Left Sidebar] | [Center Content] | [Right Panel]
 *      20%       |       50%        |     30%
 * ```
 * 
 * All panels are resizable by dragging the handles.
 * Left and right panels can be collapsed/hidden.
 */
export function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  onLeftPanelToggle,
  onRightPanelToggle,
}: ResizableLayoutProps) {
  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isRightVisible, setIsRightVisible] = useState(true);

  const handleLeftToggle = () => {
    const newState = !isLeftVisible;
    setIsLeftVisible(newState);
    onLeftPanelToggle?.(newState);
  };

  const handleRightToggle = () => {
    const newState = !isRightVisible;
    setIsRightVisible(newState);
    onRightPanelToggle?.(newState);
  };

  return (
    <div className="relative h-full w-full">
      {/* Resizable Panel Group */}
      <PanelGroup
        direction="horizontal"
        autoSaveId="shepyard-layout"
        className="h-full"
      >
        {/* Left Panel - Sidebar */}
        {isLeftVisible && (
          <>
            <Panel
              id="sidebar"
              defaultSize={20}
              minSize={15}
              maxSize={35}
              collapsible={true}
              className="bg-vscode-sidebar"
            >
              {leftPanel}
            </Panel>

            <ResizeHandle />
          </>
        )}

        {/* Center Panel - Code Viewer */}
        <Panel
          id="center"
          defaultSize={isLeftVisible && isRightVisible ? 50 : isLeftVisible ? 70 : isRightVisible ? 70 : 100}
          minSize={30}
          className="bg-vscode-bg"
        >
          {centerPanel}
        </Panel>

        {/* Right Panel - Preview & Explain */}
        {isRightVisible && (
          <>
            <ResizeHandle />

            <Panel
              id="preview"
              defaultSize={30}
              minSize={20}
              maxSize={45}
              collapsible={true}
              className="bg-vscode-bg border-l border-vscode-border"
            >
              {rightPanel}
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}

/**
 * Styled resize handle with visual feedback
 * 
 * Features:
 * - Vertical bar with hover effect
 * - Cursor changes on hover
 * - Accessible keyboard navigation
 */
function ResizeHandle() {
  return (
    <PanelResizeHandle className="resize-handle-wrapper">
      <div className="resize-handle">
        <div className="resize-handle-line" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .resize-handle-wrapper {
          position: relative;
          width: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          cursor: col-resize;
          user-select: none;
          touch-action: none;
        }

        .resize-handle {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3E3E3E;
          transition: background-color 0.2s ease;
        }

        .resize-handle:hover {
          background: #007ACC;
        }

        .resize-handle:active {
          background: #0098FF;
        }

        .resize-handle-line {
          width: 2px;
          height: 40px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 1px;
        }

        /* Keyboard focus styles for accessibility */
        .resize-handle-wrapper:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}} />
    </PanelResizeHandle>
  );
}
