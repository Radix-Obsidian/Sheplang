/**
 * useLoadShepThon Hook
 * 
 * Automatically loads ShepThon backend when a .shepthon example is selected.
 * Similar pattern to useTranspile for ShepLang.
 * 
 * Phase 3: Shepyard-ShepThon Integration
 */

import { useEffect } from 'react';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { SHEPTHON_EXAMPLES } from '../examples/exampleList';
import { loadShepThon, clearRuntime } from '../services/shepthonService';

/**
 * Hook to automatically load ShepThon when example changes
 * 
 * - Detects when a ShepThon example is active
 * - Loads runtime and extracts metadata
 * - Updates store with results
 * - Cleans up on unmount
 */
export function useLoadShepThon() {
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const setShepThonMetadata = useWorkspaceStore((state) => state.setShepThonMetadata);
  const setShepThonError = useWorkspaceStore((state) => state.setShepThonError);
  const setShepThonLoading = useWorkspaceStore((state) => state.setShepThonLoading);
  const clearShepThon = useWorkspaceStore((state) => state.clearShepThon);

  useEffect(() => {
    // Check if active example is a ShepThon backend
    const shepthonExample = SHEPTHON_EXAMPLES.find(ex => ex.id === activeExampleId);
    
    if (!shepthonExample) {
      // Not a ShepThon example, clear state
      clearShepThon();
      clearRuntime();
      return;
    }

    // Load ShepThon backend (defer to next tick to avoid blocking)
    const loadBackend = () => {
      setShepThonLoading(true);

      // Use setTimeout to defer heavy parsing to next event loop tick
      setTimeout(() => {
        console.log('[ShepThon] Starting to load:', shepthonExample.id);
        try {
          console.log('[ShepThon] Calling loadShepThon...');
          const result = loadShepThon(shepthonExample.source);
          console.log('[ShepThon] Load result:', result.success);

          if (result.success && result.metadata) {
            console.log('[ShepThon] Setting metadata:', result.metadata.name);
            setShepThonMetadata(result.metadata);
          } else {
            console.error('[ShepThon] Load failed:', result.error);
            setShepThonError(result.error || 'Failed to load ShepThon backend');
          }
        } catch (error) {
          console.error('[ShepThon] Exception during load:', error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Unknown error loading ShepThon';
          setShepThonError(errorMessage);
        }
      }, 100); // Increase timeout to 100ms for breathing room
    };

    loadBackend();
  }, [activeExampleId, setShepThonMetadata, setShepThonError, setShepThonLoading, clearShepThon]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRuntime();
    };
  }, []);
}
