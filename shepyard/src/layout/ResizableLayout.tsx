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
    <div className="relative h-full w-full flex flex-col">
      {/* Toggle Buttons Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
        <button
          onClick={handleLeftToggle}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title={isLeftVisible ? 'Hide sidebar' : 'Show sidebar'}
        >
          {isLeftVisible ? '◀' : '▶'}
          <span>{isLeftVisible ? 'Hide Sidebar' : 'Show Sidebar'}</span>
        </button>

        <div className="text-sm text-gray-600 font-medium">
          🐑 ShepYard - Creative Development Sandbox
        </div>

        <button
          onClick={handleRightToggle}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title={isRightVisible ? 'Hide preview panel' : 'Show preview panel'}
        >
          <span>{isRightVisible ? 'Hide Preview' : 'Show Preview'}</span>
          {isRightVisible ? '▶' : '◀'}
        </button>
      </div>

      {/* Resizable Panel Group */}
      <div className="flex-1 overflow-hidden">
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
                minSize={10}
                maxSize={40}
                collapsible={true}
                className="bg-white"
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
            className="bg-white"
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
                minSize={15}
                maxSize={50}
                collapsible={true}
                className="bg-white border-l border-gray-200"
              >
                {rightPanel}
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
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
          background: #e5e7eb;
          transition: background-color 0.2s ease;
        }

        .resize-handle:hover {
          background: #3b82f6;
        }

        .resize-handle:active {
          background: #2563eb;
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
