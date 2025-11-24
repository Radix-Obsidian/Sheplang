'use client';

interface Metrics {
  totalFiles: number;
  totalLines: number;
  components: number;
  apiRoutes: number;
  models: number;
  hooks: number;
  validation: number;
  generationTime: number;
}

interface MetricsPanelProps {
  metrics: Metrics;
}

function MetricCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200">
      <div className={`text-2xl ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  );
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="border-b bg-linear-to-r from-blue-50 to-purple-50 p-6">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <MetricCard
          icon="📦"
          label="Total Files"
          value={metrics.totalFiles}
          color="text-blue-600"
        />
        <MetricCard
          icon="📝"
          label="Lines of Code"
          value={metrics.totalLines.toLocaleString()}
          color="text-green-600"
        />
        <MetricCard
          icon="⚛️"
          label="React Components"
          value={metrics.components}
          color="text-cyan-600"
        />
        <MetricCard
          icon="🚀"
          label="API Routes"
          value={metrics.apiRoutes}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon="🗄️"
          label="Database Models"
          value={metrics.models}
          color="text-indigo-600"
        />
        <MetricCard
          icon="🔄"
          label="Real-time Hooks"
          value={metrics.hooks}
          color="text-orange-600"
        />
        <MetricCard
          icon="✓"
          label="Validation Rules"
          value={metrics.validation}
          color="text-emerald-600"
        />
        <MetricCard
          icon="⚡"
          label="Generation Time"
          value={`${metrics.generationTime}ms`}
          color="text-yellow-600"
        />
      </div>

      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Production-Ready Full Stack</h4>
            <p className="text-sm text-gray-600">
              Complete React + TypeScript frontend • Express + Prisma backend • Real-time WebSocket • 
              JWT Authentication • Form Validation • API Documentation • Error Handling • Type Safety
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
