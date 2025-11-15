/**
 * ExplorerView Component
 * 
 * VS Code-style file tree explorer
 * Groups items by type: Screens, Backend, Data
 */

import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { SHEP_EXAMPLES, SHEPTHON_EXAMPLES } from '../examples/exampleList';
import { FileTree } from '../sidebar/FileTree';

export function ExplorerView() {
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const setActiveExample = useWorkspaceStore((state) => state.setActiveExample);
  const shepthonMetadata = useWorkspaceStore((state) => state.shepthon.metadata);

  const fileTreeNodes = [
    {
      id: 'screens-folder',
      name: 'Screens',
      type: 'folder' as const,
      icon: '📱',
      children: SHEP_EXAMPLES.map(ex => ({
        id: ex.id,
        name: ex.name,
        type: 'file' as const,
        icon: '📄'
      }))
    },
    {
      id: 'backend-folder',
      name: 'Backend',
      type: 'folder' as const,
      icon: '⚡',
      children: SHEPTHON_EXAMPLES.map(ex => ({
        id: ex.id,
        name: ex.name,
        type: 'file' as const,
        icon: '⚡'
      }))
    },
    ...(shepthonMetadata && shepthonMetadata.models.length > 0 ? [{
      id: 'data-folder',
      name: 'Data',
      type: 'folder' as const,
      icon: '📦',
      children: shepthonMetadata.models.map(m => ({
        id: `model-${m.name}`,
        name: `${m.name} (${m.fieldCount} fields)`,
        type: 'file' as const,
        icon: '🗄️'
      }))
    }] : [])
  ];

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
        ShepYard Project
      </div>
      <FileTree
        nodes={fileTreeNodes}
        onFileSelect={setActiveExample}
        selectedId={activeExampleId || undefined}
      />
    </div>
  );
}
