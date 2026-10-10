import React from 'react';
import { MasteryItem } from '../../types';

interface OutcomeBarChartProps {
  items: MasteryItem[] | { code: string; percent: number; label?: string }[];
  title?: string;
  className?: string;
}

export const OutcomeBarChart: React.FC<OutcomeBarChartProps> = ({
  items,
  title = 'Mastery by Learning Outcome',
  className = ''
}) => {
  const chartHeight = 220;
  const maxValue = 100;

  // Normalized items
  const data = items.map((it: any) => ({
    code: it.outcome?.code || it.code,
    percent: it.percent,
    statement: it.outcome?.statement || it.label || ''
  }));

  return (
    <div className={`p-5 rounded-xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{title}</h4>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500" />
            <span className="font-medium">Developing (50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500" />
            <span className="font-medium">Strong (70%)</span>
          </div>
        </div>
      </div>

      <div className="relative pt-6 pb-2" style={{ height: `${chartHeight}px` }}>
        {/* Horizontal grid & threshold lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[11px] font-mono text-slate-400">
          <div className="relative border-b border-slate-200 dark:border-slate-800">
            <span className="absolute -top-3 right-0 font-medium">100%</span>
          </div>
          {/* 70% Strong line */}
          <div className="relative border-b border-dashed border-emerald-500/50">
            <span className="absolute -top-3 right-0 text-emerald-600 dark:text-emerald-400 font-bold">70%</span>
          </div>
          {/* 50% Developing line */}
          <div className="relative border-b border-dashed border-amber-500/50">
            <span className="absolute -top-3 right-0 text-amber-600 dark:text-amber-400 font-bold">50%</span>
          </div>
          <div className="relative border-b border-slate-200 dark:border-slate-800">
            <span className="absolute -top-3 right-0 font-medium">0%</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative h-full flex items-end justify-around px-4 pb-8 z-10">
          {data.map((item, index) => {
            const barHeightPct = (item.percent / maxValue) * 100;
            const isWeak = item.percent < 50;
            const isDeveloping = item.percent >= 50 && item.percent < 70;
            const colorClass = isWeak
              ? 'bg-rose-500 hover:bg-rose-600'
              : isDeveloping
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-emerald-500 hover:bg-emerald-600';

            return (
              <div key={index} className="flex flex-col items-center group relative h-full justify-end max-w-[4rem] w-full">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[11px] font-mono py-1 px-2 rounded pointer-events-none shadow-lg z-20 whitespace-nowrap">
                  {item.code}: {item.percent}%
                </div>

                {/* Score label above bar */}
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mb-1">
                  {item.percent}%
                </span>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${colorClass} shadow-md`}
                  style={{ height: `${Math.min(100, Math.max(8, barHeightPct * 0.85))}%` }}
                />

                {/* Outcome code label below bar */}
                <span className="absolute -bottom-6 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {item.code}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
