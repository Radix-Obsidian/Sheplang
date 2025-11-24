import React, { useState, useEffect, useRef } from 'react';
import './SplitPane.css';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

const SplitPane: React.FC<SplitPaneProps> = ({ left, right }) => {
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Handle mouse down on divider
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
  };

  // Calculate split position from mouse position
  const updateSplitPosition = (clientX: number) => {
    if (!splitPaneRef.current) return;
    
    const splitPaneRect = splitPaneRef.current.getBoundingClientRect();
    const splitPaneWidth = splitPaneRect.width;
    const newPosition = ((clientX - splitPaneRect.left) / splitPaneWidth) * 100;
    
    // Limit position to between 20% and 80%
    const limitedPosition = Math.min(Math.max(newPosition, 20), 80);
    setSplitPosition(limitedPosition);
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updateSplitPosition(e.clientX);
    };

    // Handle mouse up - stop dragging
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="split-pane" ref={splitPaneRef}>
      <div
        className="split-pane-left"
        style={{ width: `${splitPosition}%` }}
      >
        {left}
      </div>
      
      <div 
        className="split-pane-divider"
        ref={dividerRef}
        onMouseDown={handleMouseDown}
      />
      
      <div 
        className="split-pane-right"
        style={{ width: `${100 - splitPosition}%` }}
      >
        {right}
      </div>
    </div>
  );
};

export default SplitPane;
