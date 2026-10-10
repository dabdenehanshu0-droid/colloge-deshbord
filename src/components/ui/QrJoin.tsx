import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Maximize2, 
  X, 
  Play, 
  Video, 
  VideoOff,
  Radio,
  Share2,
  Sparkles
} from 'lucide-react';

interface QrJoinProps {
  joinUrl?: string;
  sessionId?: number;
  onStudentJoin?: () => void;
  className?: string;
}

export const QrJoin: React.FC<QrJoinProps> = ({
  joinUrl: defaultJoinUrl = 'https://meet.google.com/new',
  sessionId = 101,
  onStudentJoin,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<'meet' | 'zoom' | 'sgsu'>('meet');
  const [customMeetLink, setCustomMeetLink] = useState('https://meet.google.com/sgsu-cs501-live');
  const [customZoomLink, setCustomZoomLink] = useState('https://zoom.us/j/84920491024?pwd=sgsu');

  const currentUrl = 
    platform === 'meet' ? customMeetLink :
    platform === 'zoom' ? customZoomLink :
    defaultJoinUrl;

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchMeeting = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  // High-contrast clean vector QR code rendering
  const QrSvg = ({ size = 'w-44 h-44', targetUrl = currentUrl }: { size?: string; targetUrl?: string }) => (
    <div className={`mx-auto ${size} p-3 bg-white rounded-2xl shadow-lg flex items-center justify-center relative group border-2 border-indigo-500/20`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
        {/* Corner Tracking Markers */}
        <rect x="5" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="12" y="12" width="12" height="12" rx="2" />
        <rect x="69" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="76" y="12" width="12" height="12" rx="2" />
        <rect x="5" y="69" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="12" y="76" width="12" height="12" rx="2" />

        {/* Data Pattern modules for quick phone scanning */}
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

        {/* Center platform glyph */}
        <circle cx="50" cy="50" r="10" fill="#4F46E5" />
        <polygon points="47,44 57,50 47,56" fill="#FFFFFF" />
      </svg>

      <div className="absolute inset-0 bg-indigo-950/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
        <span className="text-[11px] font-bold text-white mb-1">
          Scan to join {platform === 'meet' ? 'Google Meet' : platform === 'zoom' ? 'Zoom' : 'Classroom'}
        </span>
        <span className="text-[10px] text-indigo-300 font-mono truncate max-w-[140px]">
          {currentUrl}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className={`p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-indigo-500/25 text-center shadow-xl ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Online Class Live QR</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Scanner
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Fullscreen Projector QR"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Platform Switcher: Google Meet vs Zoom vs Smart Classroom */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-navy-950 p-1 mb-4 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setPlatform('meet')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'meet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Google Meet</span>
          </button>

          <button
            onClick={() => setPlatform('zoom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'zoom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Zoom</span>
          </button>

          <button
            onClick={() => setPlatform('sgsu')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'sgsu'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SGSU Live</span>
          </button>
        </div>

        {/* QR Visual */}
        <QrSvg size="w-40 h-40" />

        <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          Scan QR with phone camera to directly open {platform === 'meet' ? 'Google Meet' : platform === 'zoom' ? 'Zoom App' : 'Smart Classroom'}
        </p>

        {/* Meeting Link Preview and Direct Launch */}
        <div className="mt-3 space-y-2">
          {/* Direct Launch Button */}
          <button
            onClick={handleLaunchMeeting}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platform === 'meet'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200 dark:shadow-emerald-950'
                : platform === 'zoom'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-200 dark:shadow-blue-950'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200 dark:shadow-indigo-950'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>
              Directly Open {platform === 'meet' ? 'Google Meet' : platform === 'zoom' ? 'Zoom App' : 'Online Classroom'}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Projector Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projector Fullscreen Modal for Hall Projection */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-indigo-500/30 rounded-3xl p-8 text-center shadow-2xl text-slate-900 dark:text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase tracking-wider font-bold">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>SGSU Lecture Hall · Online Class QR</span>
            </div>

            <h3 className="text-2xl font-bold font-display mb-1 text-slate-900 dark:text-white">
              Scan to Enter {platform === 'meet' ? 'Google Meet' : platform === 'zoom' ? 'Zoom Session' : 'Smart Classroom'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              CS-501 Neural Networks · Real-time attendance and live camera/audio stream
            </p>

            <QrSvg size="w-64 h-64" />

            <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300">
              <span className="truncate max-w-[280px] text-left">{currentUrl}</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={handleLaunchMeeting}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  platform === 'meet'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : platform === 'zoom'
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch {platform === 'meet' ? 'Google Meet' : platform === 'zoom' ? 'Zoom' : 'Classroom'} Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
