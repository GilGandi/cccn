export default function WoodCross({ opacity = 0.04, className = '' }: { opacity?: number; className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 280"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity, width: 'min(80vw, 560px)', height: 'auto' }}
      >
        <defs>
          <linearGradient id="wv" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6b4c2a" />
            <stop offset="18%"  stopColor="#8b6340" />
            <stop offset="35%"  stopColor="#7a5535" />
            <stop offset="50%"  stopColor="#9c7248" />
            <stop offset="65%"  stopColor="#7a5535" />
            <stop offset="82%"  stopColor="#8b6340" />
            <stop offset="100%" stopColor="#6b4c2a" />
          </linearGradient>
          <linearGradient id="wh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6b4c2a" />
            <stop offset="15%"  stopColor="#8b6340" />
            <stop offset="30%"  stopColor="#7a5535" />
            <stop offset="50%"  stopColor="#9c7248" />
            <stop offset="70%"  stopColor="#7a5535" />
            <stop offset="85%"  stopColor="#8b6340" />
            <stop offset="100%" stopColor="#6b4c2a" />
          </linearGradient>
          <linearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#2a1a0a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2a1a0a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sr" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#2a1a0a" stopOpacity="0" />
            <stop offset="100%" stopColor="#2a1a0a" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="st" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2a1a0a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2a1a0a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2a1a0a" stopOpacity="0" />
            <stop offset="100%" stopColor="#2a1a0a" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="hv" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#d4a86a" stopOpacity="0" />
            <stop offset="50%"  stopColor="#e8c48a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4a86a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d4a86a" stopOpacity="0" />
            <stop offset="50%"  stopColor="#e8c48a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4a86a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Vertical beam */}
        <rect x="82" y="0" width="36" height="280" rx="3" fill="url(#wv)" />
        <rect x="82" y="0" width="36" height="280" rx="3" fill="url(#sl)" opacity="0.7" />
        <rect x="82" y="0" width="36" height="280" rx="3" fill="url(#sr)" opacity="0.7" />
        <rect x="82" y="0" width="36" height="280" rx="3" fill="url(#hv)" />
        {/* Horizontal beam */}
        <rect x="0" y="68" width="200" height="32" rx="3" fill="url(#wh)" />
        <rect x="0" y="68" width="200" height="32" rx="3" fill="url(#st)" opacity="0.6" />
        <rect x="0" y="68" width="200" height="32" rx="3" fill="url(#sb)" opacity="0.6" />
        <rect x="0" y="68" width="200" height="32" rx="3" fill="url(#hh)" />
        {/* Wood grain lines */}
        <line x1="88"  y1="0" x2="86"  y2="280" stroke="#5a3d1e" strokeWidth="0.6" opacity="0.45" />
        <line x1="96"  y1="0" x2="98"  y2="280" stroke="#5a3d1e" strokeWidth="0.4" opacity="0.3" />
        <line x1="104" y1="0" x2="102" y2="280" stroke="#5a3d1e" strokeWidth="0.5" opacity="0.4" />
        <line x1="112" y1="0" x2="114" y2="280" stroke="#5a3d1e" strokeWidth="0.4" opacity="0.3" />
        <line x1="0" y1="73" x2="200" y2="71" stroke="#5a3d1e" strokeWidth="0.5" opacity="0.4" />
        <line x1="0" y1="82" x2="200" y2="84" stroke="#5a3d1e" strokeWidth="0.4" opacity="0.28" />
        <line x1="0" y1="91" x2="200" y2="89" stroke="#5a3d1e" strokeWidth="0.4" opacity="0.32" />
        {/* Ground shadow */}
        <ellipse cx="100" cy="278" rx="18" ry="3" fill="#0a0a0a" opacity="0.5" />
      </svg>
    </div>
  )
}
