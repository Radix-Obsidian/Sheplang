/**
 * FileSystemService
 * Modern browser-based file management using File System Access API
 * Enables real local file/folder operations like VS Code
 */

export interface FileItem {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
}

class FileSystemService {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private listeners: Set<() => void> = new Set();

  /**
   * Open a folder picker and set as project root
   */
  async openProjectFolder(): Promise<FileSystemDirectoryHandle | null> {
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });
      
      this.rootHandle = handle;
      this.notifyListeners();
      return handle;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to open folder:', error);
      }
      return null;
    }
  }

  /**
   * Get current project root handle
   */
  getRootHandle(): FileSystemDirectoryHandle | null {
    return this.rootHandle;
  }

  /**
   * Read all files/folders in directory
   */
  async readDirectory(dirHandle: FileSystemDirectoryHandle): Promise<FileItem[]> {
    const items: FileItem[] = [];
    
    try {
      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        items.push({
          name: entry.name,
          path: entry.name,
          kind: entry.kind as 'file' | 'directory',
          handle: entry,
        });
      }
    } catch (error) {
      console.error('Failed to read directory:', error);
    }

    return items.sort((a, b) => {
      // Directories first, then files
      if (a.kind !== b.kind) {
        return a.kind === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Create a new file in directory
   */
  async createFile(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
    content = ''
  ): Promise<FileSystemFileHandle | null> {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      
      // Write initial content
      // @ts-ignore
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      this.notifyListeners();
      return fileHandle;
    } catch (error) {
      console.error('Failed to create file:', error);
      return null;
    }
  }

  /**
   * Create a new folder in directory
   */
  async createFolder(
    dirHandle: FileSystemDirectoryHandle,
    folderName: string
  ): Promise<FileSystemDirectoryHandle | null> {
    try {
      const newDirHandle = await dirHandle.getDirectoryHandle(folderName, { create: true });
      this.notifyListeners();
      return newDirHandle;
    } catch (error) {
      console.error('Failed to create folder:', error);
      return null;
    }
  }

  /**
   * Read file content
   */
  async readFile(fileHandle: FileSystemFileHandle): Promise<string> {
    try {
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      console.error('Failed to read file:', error);
      return '';
    }
  }

  /**
   * Write content to file
   */
  async writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<boolean> {
    try {
      // @ts-ignore
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }

  /**
   * Delete a file or folder
   */
  async deleteItem(
    parentHandle: FileSystemDirectoryHandle,
    itemName: string,
    recursive = false
  ): Promise<boolean> {
    try {
      await parentHandle.removeEntry(itemName, { recursive });
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to delete item:', error);
      return false;
    }
  }

  /**
   * Check if File System Access API is supported
   */
  isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Subscribe to file system changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Request permission for a handle
   */
  async requestPermission(
    handle: FileSystemHandle,
    mode: 'read' | 'readwrite' = 'readwrite'
  ): Promise<boolean> {
    try {
      // @ts-ignore
      const permission = await handle.queryPermission({ mode });
      if (permission === 'granted') {
        return true;
      }

      // @ts-ignore
      const requestResult = await handle.requestPermission({ mode });
      return requestResult === 'granted';
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }
}

export const fileSystemService = new FileSystemService();
