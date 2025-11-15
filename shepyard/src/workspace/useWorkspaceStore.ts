/**
 * ShepYard Workspace Store
 * 
 * Manages the active example selection and workspace state.
 * Uses Zustand for lightweight React state management.
 * 
 * Phase 2: Added transpilation state tracking
 * Phase 3: Added explain data
 */

import { create } from 'zustand';
import type { ExplainResult } from '../services/explainService';
import type { AppMetadata } from '../services/shepthonService';

interface TranspileState {
  isTranspiling: boolean;
  bobaCode: string | null;
  bobaApp: any | null;
  explainData: ExplainResult | null;
  error: string | null;
}

interface ShepThonState {
  isLoading: boolean;
  metadata: AppMetadata | null;
  jobsRunning: boolean;
  error: string | null;
}

interface WorkspaceState {
  activeExampleId: string | null;
  transpile: TranspileState;
  shepthon: ShepThonState;
  setActiveExample: (id: string) => void;
  clearActiveExample: () => void;
  setTranspileResult: (bobaCode: string, bobaApp: any, explainData: ExplainResult) => void;
  setTranspileError: (error: string) => void;
  setTranspiling: (isTranspiling: boolean) => void;
  clearTranspile: () => void;
  setShepThonMetadata: (metadata: AppMetadata) => void;
  setShepThonError: (error: string) => void;
  setShepThonLoading: (isLoading: boolean) => void;
  setJobsRunning: (running: boolean) => void;
  clearShepThon: () => void;
}

const initialTranspileState: TranspileState = {
  isTranspiling: false,
  bobaCode: null,
  bobaApp: null,
  explainData: null,
  error: null,
};

const initialShepThonState: ShepThonState = {
  isLoading: false,
  metadata: null,
  jobsRunning: false,
  error: null,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeExampleId: null,
  transpile: initialTranspileState,
  shepthon: initialShepThonState,
  
  setActiveExample: (id: string) => set({ 
    activeExampleId: id,
    transpile: initialTranspileState // Reset transpile state on example change
  }),
  
  clearActiveExample: () => set({ 
    activeExampleId: null,
    transpile: initialTranspileState 
  }),
  
  setTranspileResult: (bobaCode: string, bobaApp: any, explainData: ExplainResult) => set((state) => ({
    transpile: {
      ...state.transpile,
      isTranspiling: false,
      bobaCode,
      bobaApp,
      explainData,
      error: null,
    }
  })),
  
  setTranspileError: (error: string) => set((state) => ({
    transpile: {
      ...state.transpile,
      isTranspiling: false,
      error,
    }
  })),
  
  setTranspiling: (isTranspiling: boolean) => set((state) => ({
    transpile: {
      ...state.transpile,
      isTranspiling,
    }
  })),
  
  clearTranspile: () => set({
    transpile: initialTranspileState
  }),
  
  setShepThonMetadata: (metadata: AppMetadata) => set((state) => ({
    shepthon: {
      ...state.shepthon,
      isLoading: false,
      metadata,
      error: null,
    }
  })),
  
  setShepThonError: (error: string) => set((state) => ({
    shepthon: {
      ...state.shepthon,
      isLoading: false,
      error,
    }
  })),
  
  setShepThonLoading: (isLoading: boolean) => set((state) => ({
    shepthon: {
      ...state.shepthon,
      isLoading,
    }
  })),
  
  setJobsRunning: (running: boolean) => set((state) => ({
    shepthon: {
      ...state.shepthon,
      jobsRunning: running,
    }
  })),
  
  clearShepThon: () => set({ shepthon: initialShepThonState }),
}));
