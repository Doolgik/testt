/* Premium on-brand vector compositions.
   Each visual stands in for the briefed photography concept, rendered as
   crisp, fast-loading SVG art in the NOVA palette. */

type VisualProps = {
  className?: string;
  alt: string;
};

const frame =
  'relative overflow-hidden rounded-[20px] border border-line bg-surface';

/* Изображение 1 — Hero: executive boardroom, floor-to-ceiling windows,
   European financial district, soft morning light. */
export function HeroVisual({ className = '', alt }: VisualProps) {
  return (
    <figure className={`${frame} ${className}`} role="img" aria-label={alt}>
      <svg viewBox="0 0 1000 620" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hv-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EEF3FF" />
            <stop offset="1" stopColor="#F8FAFF" />
          </linearGradient>
          <linearGradient id="hv-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D9E5FF" />
            <stop offset="1" stopColor="#F4F7FF" />
          </linearGradient>
          <linearGradient id="hv-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBFBF9" />
            <stop offset="1" stopColor="#EFEEEA" />
          </linearGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#hv-sky)" />
        {/* Skyline beyond the glass */}
        <g opacity="0.55">
          {[
            [120, 250, 70, 250],
            [205, 200, 56, 300],
            [275, 280, 48, 220],
            [690, 230, 64, 270],
            [765, 190, 52, 310],
            [830, 260, 70, 240],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="#CBD9F7" />
          ))}
        </g>
        {/* Soft morning light wash */}
        <ellipse cx="500" cy="120" rx="520" ry="240" fill="#FFFFFF" opacity="0.5" />
        {/* Floor-to-ceiling window mullions */}
        <g stroke="#FFFFFF" strokeWidth="14">
          <line x1="333" y1="40" x2="333" y2="470" />
          <line x1="500" y1="40" x2="500" y2="470" />
          <line x1="667" y1="40" x2="667" y2="470" />
        </g>
        <rect x="40" y="40" width="920" height="430" fill="url(#hv-glass)" opacity="0.18" />
        <rect x="40" y="40" width="920" height="430" fill="none" stroke="#FFFFFF" strokeWidth="16" />
        {/* Boardroom floor */}
        <rect x="0" y="468" width="1000" height="152" fill="url(#hv-floor)" />
        {/* Conference table */}
        <ellipse cx="500" cy="560" rx="360" ry="52" fill="#111111" opacity="0.06" />
        <ellipse cx="500" cy="548" rx="340" ry="44" fill="#FFFFFF" />
        <ellipse cx="500" cy="548" rx="340" ry="44" fill="none" stroke="#E6E6E6" />
        {/* Seated figures around the table */}
        <g fill="#111111" opacity="0.82">
          {[
            [300, 512, 0.9],
            [410, 504, 1],
            [560, 504, 1],
            [690, 512, 0.9],
          ].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <circle cx="0" cy="0" r="16" />
              <path d="M-26 64c0-22 12-40 26-40s26 18 26 40Z" />
            </g>
          ))}
        </g>
        {/* Accent reflection */}
        <rect x="40" y="40" width="40" height="430" fill="#0F5EFF" opacity="0.06" />
      </svg>
    </figure>
  );
}

/* Изображение 2 — Data visualization command center. */
export function DataVisual({ className = '', alt }: VisualProps) {
  return (
    <figure className={`${frame} ${className}`} role="img" aria-label={alt}>
      <svg viewBox="0 0 1000 620" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="dv-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F4F6FB" />
          </linearGradient>
          <linearGradient id="dv-bar" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#0F5EFF" />
            <stop offset="1" stopColor="#6E9BFF" />
          </linearGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#dv-bg)" />
        {/* Main dashboard panel */}
        <rect x="60" y="70" width="560" height="480" rx="18" fill="#FFFFFF" stroke="#E6E6E6" />
        {/* Line chart */}
        <polyline
          points="100,360 180,320 260,340 340,250 420,280 500,180 580,210"
          fill="none"
          stroke="#0F5EFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points="100,360 180,320 260,340 340,250 420,280 500,180 580,210 580,470 100,470"
          fill="#0F5EFF"
          opacity="0.07"
        />
        {[
          [100, 360],
          [340, 250],
          [500, 180],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" fill="#0F5EFF" stroke="#fff" strokeWidth="2" />
        ))}
        {/* Bar chart */}
        {[120, 90, 150, 110, 170, 130].map((h, i) => (
          <rect
            key={i}
            x={110 + i * 78}
            y={520 - h}
            width="46"
            height={h}
            rx="6"
            fill="url(#dv-bar)"
            opacity={0.35 + i * 0.11}
          />
        ))}
        {/* KPI side cards */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="660" y={70 + i * 162} width="280" height="142" rx="16" fill="#FFFFFF" stroke="#E6E6E6" />
            <rect x="684" y={94 + i * 162} width="90" height="12" rx="6" fill="#D9E5FF" />
            <rect x="684" y={120 + i * 162} width="150" height="22" rx="6" fill="#111111" opacity="0.85" />
            <rect x="684" y={160 + i * 162} width="232" height="8" rx="4" fill="#F0F0EE" />
            <rect x="684" y={160 + i * 162} width={120 + i * 40} height="8" rx="4" fill="#0F5EFF" opacity="0.7" />
          </g>
        ))}
      </svg>
    </figure>
  );
}

/* Изображение 3 — Executive consultant with stakeholders (4:3). */
export function ConsultVisual({ className = '', alt }: VisualProps) {
  return (
    <figure className={`${frame} ${className}`} role="img" aria-label={alt}>
      <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="cv-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F1F4FB" />
            <stop offset="1" stopColor="#FBFBF9" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#cv-bg)" />
        {/* Window light */}
        <rect x="500" y="40" width="260" height="300" rx="10" fill="#FFFFFF" opacity="0.7" />
        <g stroke="#E6E6E6"><line x1="630" y1="40" x2="630" y2="340" /></g>
        {/* Desk */}
        <rect x="0" y="430" width="800" height="170" fill="#FFFFFF" />
        <line x1="0" y1="430" x2="800" y2="430" stroke="#E6E6E6" />
        {/* Consultant */}
        <g>
          <circle cx="250" cy="300" r="48" fill="#111111" />
          <path d="M170 470c0-58 36-104 80-104s80 46 80 104Z" fill="#111111" />
          <path d="M250 366c44 0 80 46 80 104H250Z" fill="#0F5EFF" opacity="0.85" />
        </g>
        {/* Stakeholders */}
        <g opacity="0.85" fill="#5E5E5E">
          <circle cx="520" cy="320" r="40" />
          <path d="M452 470c0-48 30-86 68-86s68 38 68 86Z" />
        </g>
        <g opacity="0.6" fill="#5E5E5E">
          <circle cx="650" cy="335" r="34" />
          <path d="M592 470c0-40 26-72 58-72s58 32 58 72Z" />
        </g>
        {/* Shared document on desk */}
        <rect x="330" y="452" width="150" height="96" rx="6" fill="#FFFFFF" stroke="#E6E6E6" />
        <rect x="348" y="472" width="80" height="8" rx="4" fill="#D9E5FF" />
        <rect x="348" y="492" width="114" height="6" rx="3" fill="#EDEDEB" />
        <rect x="348" y="508" width="96" height="6" rx="3" fill="#EDEDEB" />
      </svg>
    </figure>
  );
}

/* Изображение 4 — Abstract AI infrastructure & business processes. */
export function AIVisual({ className = '', alt }: VisualProps) {
  const nodes: [number, number][] = [
    [500, 310],
    [230, 170],
    [770, 180],
    [200, 460],
    [800, 450],
    [380, 110],
    [640, 520],
    [120, 320],
    [880, 320],
  ];
  return (
    <figure className={`${frame} ${className}`} role="img" aria-label={alt}>
      <svg viewBox="0 0 1000 620" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="ai-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#0F5EFF" />
            <stop offset="1" stopColor="#0F5EFF" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="ai-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F1F4FB" />
          </linearGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#ai-bg)" />
        {/* Connection lines */}
        <g stroke="#0F5EFF" strokeOpacity="0.28" strokeWidth="1.5">
          {nodes.slice(1).map(([x, y], i) => (
            <line key={i} x1="500" y1="310" x2={x} y2={y} />
          ))}
        </g>
        {/* Outer nodes */}
        <g>
          {nodes.slice(1).map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="26" fill="#FFFFFF" stroke="#D9E5FF" strokeWidth="2" />
              <circle cx={x} cy={y} r="7" fill="#0F5EFF" opacity="0.8" />
            </g>
          ))}
        </g>
        {/* Core */}
        <circle cx="500" cy="310" r="74" fill="#D9E5FF" opacity="0.5" />
        <circle cx="500" cy="310" r="48" fill="url(#ai-core)" />
        <circle cx="500" cy="310" r="48" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <path
          d="M484 330v-40h6l20 22v-22h6v40h-6l-20-22v22h-6Z"
          fill="#FFFFFF"
        />
      </svg>
    </figure>
  );
}
