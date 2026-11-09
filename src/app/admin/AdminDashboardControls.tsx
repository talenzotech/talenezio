'use client';

import { Download, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export default function AdminDashboardControls({
  daily,
  monthly,
  showExport = false,
  showRange = true,
  showChart = true,
  title,
}: {
  daily: AnalyticsPoint[];
  monthly: AnalyticsPoint[];
  showExport?: boolean;
  showRange?: boolean;
  showChart?: boolean;
  title?: string;
}) {
  const [range, setRange] = useState<'daily' | 'monthly'>('monthly');
  const [isExporting, setIsExporting] = useState(false);
  const points = range === 'daily' ? daily : monthly;
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  async function exportData() {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `talenezio-admin-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      {showExport && <button
          type="button"
          onClick={exportData}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? 'Preparing...' : 'Export Data'}
        </button>}

      {showChart && <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
        {showRange && <RangeButtons range={range} setRange={setRange} />}
      </div>}
      {!showChart && showRange && <RangeButtons range={range} setRange={setRange} />}

      {showChart && <div className="mb-6 flex h-48 w-full items-end justify-between gap-2 pt-6" aria-label={`${range} user registrations chart`}>
        {points.map((point) => (
          <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-semibold text-gray-400">{point.value || ''}</span>
            <div
              className={`w-full rounded-t-lg transition-all ${point.value === maxValue && point.value > 0 ? 'bg-blue-600 shadow-lg' : 'bg-blue-100 hover:bg-blue-200'}`}
              style={{ height: `${Math.max(point.value ? 8 : 2, (point.value / maxValue) * 84)}%` }}
              title={`${point.label}: ${point.value} new users`}
            />
            <span className="text-[10px] font-medium text-gray-400">{point.label}</span>
          </div>
        ))}
        </div>}
    </>
  );
}

function RangeButtons({ range, setRange }: { range: 'daily' | 'monthly'; setRange: (range: 'daily' | 'monthly') => void }) {
  return <div className="flex gap-2" role="group" aria-label="Analytics range">
    {(['daily', 'monthly'] as const).map((option) => (
      <button key={option} type="button" aria-pressed={range === option} onClick={() => setRange(option)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${range === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
        {option}
      </button>
    ))}
  </div>;
}
