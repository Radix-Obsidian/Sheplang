import React, { ReactNode, useEffect, useState } from 'react';
import Split from 'react-split';

interface SplitPaneProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  initialSizes?: number[];
  minSize?: number;
  className?: string;
}

const SplitPane: React.FC<SplitPaneProps> = ({
  leftContent,
  rightContent,
  initialSizes = [50, 50],
  minSize = 200,
  className = '',
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');

  useEffect(() => {
    // Check if mobile on initial load
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    // Update orientation based on mobile state
    setOrientation(isMobile ? 'vertical' : 'horizontal');
  }, [isMobile]);

  return (
    <div className={`split-pane-container ${className}`}>
      {isMobile ? (
        // Mobile layout: Tabbed view
        <div className="flex flex-col h-full">
          <div className="flex">
            <button 
              className="flex-1 p-2 text-center border-b-2 border-blue-500"
              onClick={() => document.getElementById('editor-panel')?.scrollIntoView()}
            >
              Editor
            </button>
            <button 
              className="flex-1 p-2 text-center"
              onClick={() => document.getElementById('preview-panel')?.scrollIntoView()}
            >
              Preview
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <div id="editor-panel" className="h-full">
              {leftContent}
            </div>
            <div id="preview-panel" className="h-full">
              {rightContent}
            </div>
          </div>
        </div>
      ) : (
        // Desktop layout: Split view
        <Split
          className="split h-full"
          direction={orientation}
          sizes={initialSizes}
          minSize={minSize}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
        >
          <div className="split-panel h-full overflow-auto">{leftContent}</div>
          <div className="split-panel h-full overflow-auto">{rightContent}</div>
        </Split>
      )}
    </div>
  );
};

export default SplitPane;
