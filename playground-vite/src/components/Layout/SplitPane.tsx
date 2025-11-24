import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SplitPane.css';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplitPosition?: number; // Allow customization
  minSize?: number; // Minimum percentage for each pane
  maxSize?: number; // Maximum percentage for each pane
}

const SplitPane: React.FC<SplitPaneProps> = ({ 
  left, 
  right, 
  defaultSplitPosition = 50,
  minSize = 20,
  maxSize = 80 
}) => {
  const [splitPosition, setSplitPosition] = useState<number>(defaultSplitPosition);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastPositionRef = useRef<number>(defaultSplitPosition);

  // Debounced update using requestAnimationFrame for smooth dragging
  const updateSplitPosition = useCallback((clientX: number) => {
    if (!splitPaneRef.current || !isDragging) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const splitPaneRect = splitPaneRef.current!.getBoundingClientRect();
      const splitPaneWidth = splitPaneRect.width;
      const newPosition = ((clientX - splitPaneRect.left) / splitPaneWidth) * 100;
      
      // Limit position to between minSize and maxSize
      const limitedPosition = Math.min(Math.max(newPosition, minSize), maxSize);
      
      // Only update if position changed significantly (reduces re-renders)
      if (Math.abs(limitedPosition - lastPositionRef.current) > 0.5) {
        lastPositionRef.current = limitedPosition;
        setSplitPosition(limitedPosition);
      }
      
      animationFrameRef.current = null;
    });
  }, [isDragging, minSize, maxSize]);

  // Handle mouse down on divider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    
    // Add dragging class to split pane
    if (splitPaneRef.current) {
      splitPaneRef.current.classList.add('dragging');
    }
    if (dividerRef.current) {
      dividerRef.current.classList.add('dragging');
    }
  }, []);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateSplitPosition(e.clientX);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // Remove dragging class
      if (splitPaneRef.current) {
        splitPaneRef.current.classList.remove('dragging');
      }
      if (dividerRef.current) {
        dividerRef.current.classList.remove('dragging');
      }
      
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    // Only add listeners when dragging
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp, { once: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateSplitPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Reset body styles in case component unmounts during drag
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  // Handle window resize to maintain proportions
  useEffect(() => {
    const handleResize = () => {
      // Optionally recalculate position on window resize
      // For now, we keep the current percentage
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="split-pane" ref={splitPaneRef}>
      <div
        className="split-pane-left"
        style={{ 
          width: `${splitPosition}%`,
          minWidth: `${minSize}%`,
          maxWidth: `${maxSize}%`
        }}
      >
        {left}
      </div>
      
      <div 
        className="split-pane-divider"
        ref={dividerRef}
        onMouseDown={handleMouseDown}
        title="Drag to resize panels"
      />
      
      <div 
        className="split-pane-right"
        style={{ 
          width: `${100 - splitPosition}%`,
          minWidth: `${100 - maxSize}%`,
          maxWidth: `${100 - minSize}%`
        }}
      >
        {right}
      </div>
    </div>
  );
};

export default SplitPane;
