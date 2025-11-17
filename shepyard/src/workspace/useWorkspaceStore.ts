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
  appModel: any | null; // AppModel with source locations for click-to-navigate
  explainData: ExplainResult | null;
  error: string | null;
  errorDetails?: {
    message: string;
    source: string;
  };
}

interface ShepThonState {
  isLoading: boolean;
  metadata: AppMetadata | null;
  jobsRunning: boolean;
  error: string | null;
}

interface LocalFileState {
  fileName: string | null;
  content: string;
  handle: FileSystemFileHandle | null;
  isDirty: boolean;
}

interface WorkspaceState {
  activeExampleId: string | null;
  transpile: TranspileState;
  shepthon: ShepThonState;
  localFile: LocalFileState;
  editorInstance: any | null; // Monaco editor instance for navigation
  setActiveExample: (id: string) => void;
  clearActiveExample: () => void;
  setTranspileResult: (bobaCode: string, bobaApp: any, explainData: ExplainResult, appModel?: any) => void;
  setTranspileError: (error: string, errorDetails?: { message: string; source: string }) => void;
  setTranspiling: (isTranspiling: boolean) => void;
  clearTranspile: () => void;
  setShepThonMetadata: (metadata: AppMetadata) => void;
  setShepThonError: (error: string) => void;
  setShepThonLoading: (isLoading: boolean) => void;
  setJobsRunning: (running: boolean) => void;
  clearShepThon: () => void;
  setLocalFileContent: (fileName: string, content: string, handle: FileSystemFileHandle) => void;
  updateLocalFileContent: (content: string) => void;
  saveLocalFile: () => Promise<boolean>;
  clearLocalFile: () => void;
  setEditorInstance: (editor: any) => void;
  navigateToLine: (line: number) => void;
  applyAutoFix: (suggestion: any) => void;
}

const initialTranspileState: TranspileState = {
  isTranspiling: false,
  bobaCode: null,
  bobaApp: null,
  appModel: null,
  explainData: null,
  error: null,
};

const initialShepThonState: ShepThonState = {
  isLoading: false,
  metadata: null,
  jobsRunning: false,
  error: null,
};

const initialLocalFileState: LocalFileState = {
  fileName: null,
  content: '',
  handle: null,
  isDirty: false,
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeExampleId: null,
  transpile: initialTranspileState,
  shepthon: initialShepThonState,
  localFile: initialLocalFileState,
  editorInstance: null,
  
  setActiveExample: (id: string) => set({ 
    activeExampleId: id,
    transpile: initialTranspileState // Reset transpile state on example change
  }),
  
  clearActiveExample: () => set({ 
    activeExampleId: null,
    transpile: initialTranspileState 
  }),
  
  setTranspileResult: (bobaCode: string, bobaApp: any, explainData: ExplainResult, appModel?: any) => set((state) => ({
    transpile: {
      ...state.transpile,
      isTranspiling: false,
      bobaCode,
      bobaApp,
      appModel,
      explainData,
      error: null,
    }
  })),
  
  setTranspileError: (error: string, errorDetails?: { message: string; source: string }) => set((state) => ({
    transpile: {
      ...state.transpile,
      isTranspiling: false,
      error,
      errorDetails,
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
  
  setLocalFileContent: (fileName: string, content: string, handle: FileSystemFileHandle) => set({
    localFile: {
      fileName,
      content,
      handle,
      isDirty: false,
    },
    activeExampleId: null, // Clear example when opening local file
  }),
  
  updateLocalFileContent: (content: string) => set((state) => ({
    localFile: {
      ...state.localFile,
      content,
      isDirty: true,
    }
  })),
  
  saveLocalFile: async () => {
    const { localFile } = get();
    if (!localFile.handle) return false;
    
    try {
      // @ts-ignore - File System Access API
      const writable = await localFile.handle.createWritable();
      await writable.write(localFile.content);
      await writable.close();
      
      set((state) => ({
        localFile: {
          ...state.localFile,
          isDirty: false,
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  },
  
  clearLocalFile: () => set({ localFile: initialLocalFileState }),
  
  // Click-to-navigate support
  setEditorInstance: (editor: any) => set({ editorInstance: editor }),
  
  navigateToLine: (line: number) => {
    const { editorInstance } = get();
    if (!editorInstance) return;
    
    // Reveal line in center of viewport
    editorInstance.revealLineInCenter(line);
    
    // Set selection to highlight the line
    editorInstance.setSelection({
      startLineNumber: line,
      startColumn: 1,
      endLineNumber: line,
      endColumn: Number.MAX_VALUE,
    });
    
    // Focus the editor
    editorInstance.focus();
  },
  
  /**
   * Apply an auto-fix suggestion to the editor
   * Modifies the code and triggers re-transpilation
   */
  applyAutoFix: (suggestion: any) => {
    const { editorInstance } = get();
    if (!editorInstance || !suggestion.autoFix) return;
    
    const model = editorInstance.getModel();
    if (!model) return;
    
    // Get the fix changes
    const { autoFix } = suggestion;
    
    // If there are explicit changes, apply them
    if (autoFix.changes && autoFix.changes.length > 0) {
      const edits = autoFix.changes.map((change: any) => ({
        range: {
          startLineNumber: change.range.startLine,
          startColumn: change.range.startColumn,
          endLineNumber: change.range.endLine,
          endColumn: change.range.endColumn,
        },
        text: change.newText,
      }));
      
      // Apply all edits
      model.pushEditOperations([], edits, () => null);
    } 
    // If there's a simple replacement, apply it at the error location
    else if (autoFix.replacement && suggestion.line && suggestion.column) {
      const line = suggestion.line;
      const column = suggestion.column;
      const endColumn = suggestion.endColumn || column + 10; // Default length
      
      const edit = {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: endColumn,
        },
        text: autoFix.replacement,
      };
      
      model.pushEditOperations([], [edit], () => null);
    }
    
    // Clear the error since we applied a fix
    set((state) => ({
      transpile: {
        ...state.transpile,
        error: null,
        errorDetails: undefined,
      }
    }));
    
    // Focus editor
    editorInstance.focus();
    
    // Note: Re-transpilation will happen automatically via useTranspile hook
    // watching the editor content changes
  },
}));
