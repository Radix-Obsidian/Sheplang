'use client';

interface FileTreeProps {
  files: string[];
  selectedFile: string;
  onSelectFile: (file: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  children?: Record<string, FileNode>;
  isFile: boolean;
}

function buildFileTree(files: string[]): Record<string, FileNode> {
  const root: Record<string, FileNode> = {};

  files.forEach(filePath => {
    const parts = filePath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          children: isLastPart ? undefined : {},
          isFile: isLastPart
        };
      }

      if (!isLastPart && current[part].children) {
        current = current[part].children!;
      }
    });
  });

  return root;
}

function FileTreeNode({ node, selectedFile, onSelectFile, depth = 0 }: {
  node: FileNode;
  selectedFile: string;
  onSelectFile: (file: string) => void;
  depth?: number;
}) {
  const isSelected = node.path === selectedFile;
  const hasChildren = node.children && Object.keys(node.children).length > 0;

  const getIcon = () => {
    if (node.isFile) {
      const ext = node.name.split('.').pop();
      switch (ext) {
        case 'tsx':
        case 'jsx':
          return '⚛️';
        case 'ts':
          return '📘';
        case 'js':
          return '📜';
        case 'json':
          return '⚙️';
        case 'prisma':
          return '🔷';
        case 'md':
          return '📝';
        default:
          return '📄';
      }
    }
    return '📁';
  };

  return (
    <div>
      <button
        onClick={() => node.isFile && onSelectFile(node.path)}
        className={`
          w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors
          ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
        `}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <span className="text-base">{getIcon()}</span>
        <span className="truncate">{node.name}</span>
      </button>
      
      {hasChildren && (
        <div>
          {Object.values(node.children!).map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const tree = buildFileTree(files);

  // Sort: directories first, then files, both alphabetically
  const sortedKeys = Object.keys(tree).sort((a, b) => {
    const aIsFile = tree[a].isFile;
    const bIsFile = tree[b].isFile;
    if (aIsFile === bIsFile) return a.localeCompare(b);
    return aIsFile ? 1 : -1;
  });

  return (
    <div className="py-4">
      <div className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Generated Files
      </div>
      {sortedKeys.map(key => (
        <FileTreeNode
          key={tree[key].path}
          node={tree[key]}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
