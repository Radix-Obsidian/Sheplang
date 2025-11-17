/**
 * ProblemsView Component
 * 
 * Integration of ProblemsPanel into the bottom panel.
 * Displays real transpilation errors with auto-fix capabilities.
 */

import { ProblemsPanel } from '../ui/ProblemsPanel';

export function ProblemsView() {
  return (
    <div className="h-full overflow-hidden">
      <ProblemsPanel showHeader={false} />
    </div>
  );
}
