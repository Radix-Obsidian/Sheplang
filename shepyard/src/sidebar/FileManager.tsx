/**
 * FileManager Component
 * VS Code-style file management with local file system integration
 * Create, delete, rename files and folders
 */

import { useState, useEffect } from 'react';
import { fileSystemService, type FileItem } from '../services/fileSystemService';
import { logService } from '../services/logService';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';

export function FileManager() {
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const setLocalFileContent = useWorkspaceStore((state) => state.setLocalFileContent);

  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(() => {
      loadFiles();
    });
    return unsubscribe;
  }, []);

  const handleOpenProject = async () => {
    const handle = await fileSystemService.openProjectFolder();
    if (handle) {
      setProjectName(handle.name);
      setProjectOpen(true);
      logService.success('system', `📁 Opened project: ${handle.name}`);
      await loadFiles();
    }
  };

  const loadFiles = async () => {
    const rootHandle = fileSystemService.getRootHandle();
    if (rootHandle) {
      const items = await fileSystemService.readDirectory(rootHandle);
      setFiles(items);
    }
  };

  const handleCreateFile = async () => {
    if (!newItemName.trim()) return;

    const rootHandle = fileSystemService.getRootHandle();
    if (!rootHandle) return;

    const fileName = newItemName.trim();
    const fileHandle = await fileSystemService.createFile(rootHandle, fileName, '// New ShepLang file\n');
    
    if (fileHandle) {
      logService.success('system', `✓ Created file: ${fileName}`);
      setNewItemName('');
      setShowNewFileDialog(false);
      await loadFiles();
    } else {
      logService.error('system', `✗ Failed to create file: ${fileName}`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newItemName.trim()) return;

    const rootHandle = fileSystemService.getRootHandle();
    if (!rootHandle) return;

    const folderName = newItemName.trim();
    const folderHandle = await fileSystemService.createFolder(rootHandle, folderName);
    
    if (folderHandle) {
      logService.success('system', `✓ Created folder: ${folderName}`);
      setNewItemName('');
      setShowNewFolderDialog(false);
      await loadFiles();
    } else {
      logService.error('system', `✗ Failed to create folder: ${folderName}`);
    }
  };

  const handleDeleteItem = async (item: FileItem) => {
    if (!confirm(`Delete ${item.name}?`)) return;

    const rootHandle = fileSystemService.getRootHandle();
    if (!rootHandle) return;

    const success = await fileSystemService.deleteItem(
      rootHandle,
      item.name,
      item.kind === 'directory'
    );

    if (success) {
      logService.success('system', `✓ Deleted: ${item.name}`);
      await loadFiles();
    } else {
      logService.error('system', `✗ Failed to delete: ${item.name}`);
    }
  };

  const handleFileClick = async (item: FileItem) => {
    if (item.kind === 'directory') {
      // TODO: Navigate into folder
      return;
    }

    if (!item.handle || item.handle.kind !== 'file') return;

    try {
      const fileHandle = item.handle as FileSystemFileHandle;
      const content = await fileSystemService.readFile(fileHandle);
      
      setSelectedFile(item.name);
      setLocalFileContent(item.name, content, fileHandle);
      
      logService.info('system', `📄 Opened: ${item.name}`);
    } catch (error) {
      logService.error('system', `✗ Failed to open: ${item.name}`);
    }
  };

  if (!fileSystemService.isSupported()) {
    return (
      <div className="p-4 text-center">
        <div className="text-vscode-error text-sm mb-2">⚠️</div>
        <div className="text-xs text-gray-400">
          File System Access API not supported.
          <br />
          Please use Chrome, Edge, or Opera.
        </div>
      </div>
    );
  }

  if (!projectOpen) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-sm font-semibold text-vscode-fg mb-2">
            No Folder Open
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Open a folder on your computer to start managing files
          </p>
          <button
            onClick={handleOpenProject}
            className="px-4 py-2 bg-vscode-button hover:bg-vscode-buttonHover text-white rounded text-sm transition-colors"
          >
            Open Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-vscode-border bg-vscode-activityBar">
        <div className="text-xs font-semibold text-gray-400 uppercase truncate">
          {projectName}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="p-1 hover:bg-vscode-hover rounded text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            📄
          </button>
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="p-1 hover:bg-vscode-hover rounded text-gray-400 hover:text-white transition-colors"
            title="New Folder"
          >
            📁
          </button>
          <button
            onClick={loadFiles}
            className="p-1 hover:bg-vscode-hover rounded text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500">
            Folder is empty
          </div>
        ) : (
          <div>
            {files.map((item) => (
              <div
                key={item.name}
                onClick={() => handleFileClick(item)}
                className={`flex items-center justify-between px-3 py-1 hover:bg-vscode-hover group cursor-pointer ${
                  selectedFile === item.name ? 'bg-vscode-selection' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span>{item.kind === 'directory' ? '📁' : '📄'}</span>
                  <span className="text-sm text-vscode-fg truncate">
                    {item.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-vscode-error/20 hover:text-vscode-error rounded transition-all text-xs"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-4 min-w-[300px]">
            <h3 className="text-sm font-semibold text-vscode-fg mb-3">
              Create New File
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              placeholder="filename.shep"
              className="w-full px-3 py-2 bg-vscode-input border border-vscode-border rounded text-sm text-vscode-fg mb-3"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewItemName('');
                }}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="px-3 py-1 bg-vscode-button hover:bg-vscode-buttonHover text-white rounded text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-4 min-w-[300px]">
            <h3 className="text-sm font-semibold text-vscode-fg mb-3">
              Create New Folder
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="folder-name"
              className="w-full px-3 py-2 bg-vscode-input border border-vscode-border rounded text-sm text-vscode-fg mb-3"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewItemName('');
                }}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-3 py-1 bg-vscode-button hover:bg-vscode-buttonHover text-white rounded text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
