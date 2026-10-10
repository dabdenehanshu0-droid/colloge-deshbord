import React, { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QrJoinProps {
  joinUrl: string;
  sessionId?: number;
  onStudentJoin?: () => void;
  className?: string;
}

export const QrJoin: React.FC<QrJoinProps> = ({
  joinUrl,
  sessionId = 101,
  onStudentJoin,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 rounded-xl bg-navy-900/90 border border-indigo-500/20 text-center ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <QrCode className="w-4 h-4 text-indigo-400" />
          <span>Student Live Join</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">SESSION #{sessionId}</span>
      </div>

      {/* High-contrast QR SVG Visual */}
      <div className="mx-auto w-40 h-40 p-2.5 bg-white rounded-lg shadow-md flex items-center justify-center relative group">
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
          {/* Top-Left Corner Box */}
          <rect x="5" y="5" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
          <rect x="12" y="12" width="12" height="12" rx="1" />
          {/* Top-Right Corner Box */}
          <rect x="69" y="5" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
          <rect x="76" y="12" width="12" height="12" rx="1" />
          {/* Bottom-Left Corner Box */}
          <rect x="5" y="69" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
          <rect x="12" y="76" width="12" height="12" rx="1" />
          {/* Data Matrix Dots Pattern */}
          <rect x="36" y="8" width="6" height="6" />
          <rect x="46" y="14" width="6" height="6" />
          <rect x="56" y="8" width="6" height="6" />
          <rect x="38" y="24" width="6" height="6" />
          <rect x="48" y="24" width="6" height="6" />
          <rect x="8" y="38" width="6" height="6" />
          <rect x="20" y="44" width="6" height="6" />
          <rect x="35" y="38" width="7" height="7" />
          <rect x="46" y="38" width="7" height="7" />
          <rect x="57" y="38" width="7" height="7" />
          <rect x="68" y="44" width="6" height="6" />
          <rect x="80" y="38" width="7" height="7" />
          <rect x="38" y="50" width="6" height="6" />
          <rect x="50" y="50" width="8" height="8" />
          <rect x="64" y="56" width="6" height="6" />
          <rect x="78" y="52" width="6" height="6" />
          <rect x="38" y="66" width="6" height="6" />
          <rect x="52" y="66" width="7" height="7" />
          <rect x="68" y="70" width="6" height="6" />
          <rect x="80" y="66" width="6" height="6" />
          <rect x="38" y="78" width="8" height="8" />
          <rect x="54" y="80" width="6" height="6" />
          <rect x="66" y="82" width="8" height="8" />
          <rect x="82" y="78" width="6" height="6" />
        </svg>
        <div className="absolute inset-0 bg-indigo-950/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
          <span className="text-[11px] font-medium text-white leading-tight">
            Scan with mobile or click below to simulate student join
          </span>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-300">
        Students join using phone or browser window
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy URL'}</span>
        </button>

        {onStudentJoin && (
          <button
            onClick={onStudentJoin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Student View</span>
          </button>
        )}
      </div>
    </div>
  );
};
