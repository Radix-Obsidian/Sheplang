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

    // TEMPORARY: Disable auto-loading due to parser hanging
    // TODO: Move to Web Worker (see research: vite-plugin-comlink)
    console.log('[ShepThon] Auto-loading disabled - parser causes browser hang');
    console.log('[ShepThon] Solution: Implement Web Worker with Comlink');
    setShepThonError('ShepThon auto-loading temporarily disabled. Parser needs Web Worker implementation.');
    return;

    // Load ShepThon backend (defer to next tick to avoid blocking)
    // COMMENTED OUT - Causes browser hang
    // const loadBackend = () => {
    //   setShepThonLoading(true);
    //   setTimeout(() => {
    //     console.log('[ShepThon] Starting to load:', shepthonExample.id);
    //     try {
    //       const result = loadShepThon(shepthonExample.source);
    //       if (result.success && result.metadata) {
    //         setShepThonMetadata(result.metadata);
    //       } else {
    //         setShepThonError(result.error || 'Failed to load ShepThon backend');
    //       }
    //     } catch (error) {
    //       const errorMessage = error instanceof Error 
    //         ? error.message 
    //         : 'Unknown error loading ShepThon';
    //       setShepThonError(errorMessage);
    //     }
    //   }, 100);
    // };
    // loadBackend();
  }, [activeExampleId, setShepThonMetadata, setShepThonError, setShepThonLoading, clearShepThon]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRuntime();
    };
  }, []);
}
