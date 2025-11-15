/**
 * ActivityBar Component
 * VS Code-style icon strip on far left
 */

interface Activity {
  id: string;
  icon: string;
  label: string;
}

interface ActivityBarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
}

const activities: Activity[] = [
  { id: 'explorer', icon: '📁', label: 'Explorer' },
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'backend', icon: '⚡', label: 'Backend' },
  { id: 'extensions', icon: '📦', label: 'Extensions' },
];

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-12 bg-vscode-activityBar border-r border-vscode-border flex flex-col items-center py-2">
      {activities.map((activity) => (
        <button
          key={activity.id}
          onClick={() => onViewChange(activity.id)}
          className={`w-full h-12 flex items-center justify-center text-2xl transition-colors relative ${
            activeView === activity.id
              ? 'text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          title={activity.label}
        >
          {activity.icon}
          {activeView === activity.id && (
            <div className="absolute left-0 w-0.5 h-full bg-vscode-statusBar" />
          )}
        </button>
      ))}
      
      <div className="flex-1" />
      
      {/* Settings at bottom */}
      <button
        className="w-full h-12 flex items-center justify-center text-2xl text-gray-400 hover:text-white transition-colors"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}
