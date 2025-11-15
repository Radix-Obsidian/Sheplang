/**
 * FileTree Component
 * VS Code-style collapsible file tree
 */

import { useState } from 'react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  icon?: string;
}

interface FileTreeProps {
  nodes: FileNode[];
  onFileSelect?: (nodeId: string) => void;
  selectedId?: string;
}

export function FileTree({ nodes, onFileSelect, selectedId }: FileTreeProps) {
  return (
    <div className="text-sm">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onFileSelect={onFileSelect}
          selectedId={selectedId}
          level={0}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  onFileSelect?: (nodeId: string) => void;
  selectedId?: string;
}

function TreeNode({ node, level, onFileSelect, selectedId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect?.(node.id);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center py-1 px-2 cursor-pointer ${
          isSelected
            ? 'bg-vscode-active text-white'
            : 'hover:bg-vscode-hover text-vscode-fg'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === 'folder' && (
          <span className="mr-1 text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span className="mr-2">{node.icon || (node.type === 'folder' ? '📁' : '📄')}</span>
        <span className="flex-1 truncate">{node.name}</span>
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
