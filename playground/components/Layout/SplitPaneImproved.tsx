import React, { useEffect, useRef, useState } from 'react';
import Split from 'react-split';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
}

/**
 * A clean implementation of a split pane component using react-split
 * with proper sizing and event handling
 */
const SplitPaneImproved: React.FC<SplitPaneProps> = ({ 
  left, 
  right, 
  direction = 'horizontal' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>([50, 50]);
  
  // Reset sizes on direction change
  useEffect(() => {
    setSizes([50, 50]);
  }, [direction]);

  return (
    <div 
      className="split-container" 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      <Split
        sizes={sizes}
        direction={direction}
        style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%',
          gap: '0'
        }}
        gutterStyle={() => ({
          backgroundColor: 'rgb(229 231 235 / 0.8)', // gray-200 with transparency
          backgroundImage: 'linear-gradient(90deg, transparent 40%, rgb(156 163 175 / 0.5) 50%, transparent 60%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50%',
          width: direction === 'horizontal' ? '6px' : '100%',
          height: direction === 'vertical' ? '6px' : '100%',
          cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
          transition: 'background-color 0.2s ease'
        })}
        onDrag={(newSizes) => {
          setSizes(newSizes);
        }}
      >
        <div 
          className="pane left-pane bg-white dark:bg-gray-900"
          style={{
            overflow: 'hidden',
            height: '100%',
            width: '100%',
            borderRight: '1px solid rgb(229 231 235)', // gray-200
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {left}
        </div>
        <div 
          className="pane right-pane bg-gray-50 dark:bg-gray-900"
          style={{
            overflow: 'hidden',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {right}
        </div>
      </Split>
    </div>
  );
};

export default SplitPaneImproved;
