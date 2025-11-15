/**
 * useLoadShepThon Hook
 * 
 * Automatically loads ShepThon backend when a .shepthon example is selected.
 * Uses Web Worker for non-blocking parsing (prevents browser hang).
 * 
 * Phase 3: Shepyard-ShepThon Integration (Web Worker Implementation)
 * Pattern: Monaco Editor Language Server, VS Code
 */

import { useEffect } from 'react';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { SHEPTHON_EXAMPLES } from '../examples/exampleList';
import { shepthonWorker } from '../workers';

/**
 * Hook to automatically load ShepThon when example changes
 * 
 * - Detects when a ShepThon example is active
 * - Loads runtime in Web Worker (non-blocking!)
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
      return;
    }

    // Load ShepThon backend in Web Worker (non-blocking!)
    const loadBackend = async () => {
      setShepThonLoading(true);

      try {
        console.log('[ShepThon] Loading in Web Worker:', shepthonExample.id);
        
        // This runs in background thread - UI stays responsive!
        const result = await shepthonWorker.loadShepThonWorker(shepthonExample.source);

        if (result.success && result.metadata) {
          console.log('[ShepThon] Loaded successfully:', result.metadata.name);
          setShepThonMetadata(result.metadata);
        } else {
          console.error('[ShepThon] Load failed:', result.error);
          setShepThonError(result.error || 'Failed to load ShepThon backend');
        }
      } catch (error) {
        console.error('[ShepThon] Worker error:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error loading ShepThon';
        setShepThonError(errorMessage);
      }
    };

    loadBackend();
  }, [activeExampleId, setShepThonMetadata, setShepThonError, setShepThonLoading, clearShepThon]);
}
