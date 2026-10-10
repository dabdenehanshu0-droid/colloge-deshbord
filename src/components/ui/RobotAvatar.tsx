import React from 'react';

interface RobotAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'thinking' | 'talking' | 'happy';
  showBadge?: boolean;
  className?: string;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  size = 'md',
  state = 'idle',
  showBadge = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const px = pixelSizes[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer ambient glow */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/25 to-indigo-500/30 blur-md ${
        state === 'thinking' ? 'animate-pulse' : ''
      }`} />

      {/* Robot SVG Graphic */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          {/* Head Body Gradient: White Ceramic Metallic Mix */}
          <linearGradient id="robotBodyGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Visor Glass Gradient: Deep Glossy Dark Screen */}
          <linearGradient id="visorGrad" x1="20" y1="35" x2="80" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="60%" stopColor="#050B14" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Cyan Glow for Eyes */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Ear Accent Gradient */}
          <linearGradient id="accentGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* 1. Antenna Rod */}
        <line x1="50" y1="20" x2="50" y2="10" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

        {/* 2. Antenna Orb (Pulsing Light) */}
        <circle cx="50" cy="8" r="5" fill="#38BDF8" filter="url(#cyanGlow)" />
        <circle cx="50" cy="8" r="2.5" fill="#FFFFFF" />

        {/* 3. Left Ear Piece */}
        <rect x="10" y="42" width="6" height="16" rx="3" fill="url(#accentGrad)" />
        <circle cx="13" cy="50" r="1.5" fill="#38BDF8" />

        {/* 4. Right Ear Piece */}
        <rect x="84" y="42" width="6" height="16" rx="3" fill="url(#accentGrad)" />
        <circle cx="87" cy="50" r="1.5" fill="#38BDF8" />

        {/* 5. Head Outer Shell (Glossy White Ceramic Look) */}
        <rect
          x="16"
          y="20"
          width="68"
          height="60"
          rx="22"
          fill="url(#robotBodyGrad)"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />

        {/* Subtle Head Top Highlight */}
        <path
          d="M 28 24 Q 50 20 72 24"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* 6. Visor Frame (Dark Face Screen) */}
        <rect
          x="23"
          y="32"
          width="54"
          height="36"
          rx="14"
          fill="url(#visorGrad)"
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* Visor Glare Reflection */}
        <path
          d="M 27 36 Q 50 34 68 39"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* 7. Robot Eyes (Cyan LED) */}
        {state === 'thinking' ? (
          // Thinking animation: cycling dots
          <>
            <circle cx="38" cy="48" r="4" fill="#38BDF8" filter="url(#cyanGlow)" />
            <circle cx="50" cy="48" r="4" fill="#6366F1" filter="url(#cyanGlow)" />
            <circle cx="62" cy="48" r="4" fill="#38BDF8" filter="url(#cyanGlow)" />
          </>
        ) : state === 'happy' ? (
          // Happy Eyes (curved arches)
          <>
            <path
              d="M 32 50 Q 38 42 44 50"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              filter="url(#cyanGlow)"
            />
            <path
              d="M 56 50 Q 62 42 68 50"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              filter="url(#cyanGlow)"
            />
          </>
        ) : (
          // Normal / Talking Eyes (pill shaped with white specular dot)
          <>
            {/* Left Eye */}
            <rect x="33" y="44" width="11" height="9" rx="4.5" fill="#38BDF8" filter="url(#cyanGlow)" />
            <circle cx="36" cy="46" r="1.5" fill="#FFFFFF" />

            {/* Right Eye */}
            <rect x="56" y="44" width="11" height="9" rx="4.5" fill="#38BDF8" filter="url(#cyanGlow)" />
            <circle cx="59" cy="46" r="1.5" fill="#FFFFFF" />

            {/* Subtle mouth or audio frequency bar */}
            {state === 'talking' ? (
              <path
                d="M 42 58 Q 50 63 58 58"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#cyanGlow)"
              />
            ) : (
              <line x1="45" y1="58" x2="55" y2="58" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            )}
          </>
        )}

        {/* 8. Cheek Blush Accents */}
        <circle cx="28" cy="54" r="2.5" fill="#F43F5E" opacity="0.45" />
        <circle cx="72" cy="54" r="2.5" fill="#F43F5E" opacity="0.45" />

        {/* 9. Neck Base Connector */}
        <rect x="42" y="80" width="16" height="5" rx="2.5" fill="#94A3B8" />
      </svg>

      {/* Online indicator badge */}
      {showBadge && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-1 ring-emerald-400 animate-pulse z-20" />
      )}
    </div>
  );
};
