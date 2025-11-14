/**
 * ShepYard Workspace Store
 * 
 * Manages the active example selection and workspace state.
 * Uses Zustand for lightweight React state management.
 * 
 * Phase 2: Added transpilation state tracking
 */

import { create } from 'zustand';

interface TranspileState {
  isTranspiling: boolean;
  bobaCode: string | null;
  bobaApp: any | null;
  error: string | null;
}

interface WorkspaceState {
  activeExampleId: string | null;
  transpile: TranspileState;
  setActiveExample: (id: string) => void;
  clearActiveExample: () => void;
  setTranspileResult: (bobaCode: string, bobaApp: any) => void;
  setTranspileError: (error: string) => void;
  setTranspiling: (isTranspiling: boolean) => void;
  clearTranspile: () => void;
}

const initialTranspileState: TranspileState = {
  isTranspiling: false,
  bobaCode: null,
  bobaApp: null,
  error: null,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeExampleId: null,
  transpile: initialTranspileState,
  
  setActiveExample: (id: string) => set({ 
    activeExampleId: id,
    transpile: initialTranspileState // Reset transpile state on example change
  }),
  
  clearActiveExample: () => set({ 
    activeExampleId: null,
    transpile: initialTranspileState 
  }),
  
  setTranspileResult: (bobaCode: string, bobaApp: any) => set((state) => ({
    transpile: {
      ...state.transpile,
      isTranspiling: false,
      bobaCode,
      bobaApp,
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
}));
