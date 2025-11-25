import { useState, useCallback, useEffect } from 'react';

interface OverlayState {
  isVisible: boolean;
  hasSeen: boolean;
}

const OVERLAY_STORAGE_KEYS = {
  react: 'sheplang-react-overlay-seen',
  typescript: 'sheplang-typescript-overlay-seen',
} as const;

type OverlayType = keyof typeof OVERLAY_STORAGE_KEYS;

export const useOverlay = (overlayType: OverlayType) => {
  const storageKey = OVERLAY_STORAGE_KEYS[overlayType];
  
  // Initialize state from localStorage
  const [state, setState] = useState<OverlayState>(() => {
    if (typeof window === 'undefined') {
      return { isVisible: false, hasSeen: true }; // Default to hidden on server
    }
    
    const hasSeen = localStorage.getItem(storageKey) === 'true';
    return { isVisible: false, hasSeen };
  });

  // Show overlay (only if user hasn't seen it)
  const showOverlay = useCallback(() => {
    setState(prev => {
      if (prev.hasSeen) {
        return prev; // Don't show if already seen
      }
      return { ...prev, isVisible: true };
    });
  }, []);

  // Hide overlay
  const hideOverlay = useCallback((permanent: boolean = false) => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      hasSeen: permanent ? true : prev.hasSeen,
    }));

    // Save to localStorage if permanent dismissal
    if (permanent && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }

    // Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'overlay_dismissed', {
        overlay_type: overlayType,
        permanent_dismissal: permanent,
      });
    }
  }, [overlayType, storageKey]);

  // Reset overlay (for testing or user preference)
  const resetOverlay = useCallback(() => {
    setState({ isVisible: false, hasSeen: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isVisible) {
        hideOverlay(false);
      }
    };

    if (state.isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [state.isVisible, hideOverlay]);

  // Track overlay view when it becomes visible
  useEffect(() => {
    if (state.isVisible && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'overlay_viewed', {
        overlay_type: overlayType,
      });
    }
  }, [state.isVisible, overlayType]);

  return {
    isVisible: state.isVisible,
    hasSeen: state.hasSeen,
    showOverlay,
    hideOverlay,
    resetOverlay,
  };
};

// Hook for managing multiple overlays
export const useOverlayManager = () => {
  const reactOverlay = useOverlay('react');
  const typescriptOverlay = useOverlay('typescript');

  // Show specific overlay by type
  const showOverlay = useCallback((type: OverlayType) => {
    switch (type) {
      case 'react':
        reactOverlay.showOverlay();
        break;
      case 'typescript':
        typescriptOverlay.showOverlay();
        break;
    }
  }, [reactOverlay.showOverlay, typescriptOverlay.showOverlay]);

  // Hide all overlays
  const hideAllOverlays = useCallback(() => {
    reactOverlay.hideOverlay(false);
    typescriptOverlay.hideOverlay(false);
  }, [reactOverlay.hideOverlay, typescriptOverlay.hideOverlay]);

  // Reset all overlays
  const resetAllOverlays = useCallback(() => {
    reactOverlay.resetOverlay();
    typescriptOverlay.resetOverlay();
  }, [reactOverlay.resetOverlay, typescriptOverlay.resetOverlay]);

  // Check if any overlay is visible
  const isAnyOverlayVisible = reactOverlay.isVisible || typescriptOverlay.isVisible;

  return {
    react: reactOverlay,
    typescript: typescriptOverlay,
    showOverlay,
    hideAllOverlays,
    resetAllOverlays,
    isAnyOverlayVisible,
  };
};

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, options?: any) => void;
  }
}
