const landShapes = (
  <>
    {/* North America */}
    <path d="M42 142 78 104l62-22 52 16 31 34-20 28-35 7-18 31-30 11-21 42-31-11-8-43-35-22Z" />
    {/* South America */}
    <path d="m177 245 38 15 20 35-8 42-22 31-9 54-25 52-19-20 6-50-16-44 11-42-18-37Z" />
    {/* Europe and Asia */}
    <path d="m272 127 39-26 42 9 26-19 55 14 31-9 67 29 27 33-18 25-47-3-28 18-43-4-24 25-31-13-29 14-24-23-47 1-17-28Z" />
    {/* Africa */}
    <path d="m309 220 61-13 48 21 16 38-25 37-12 57-36 56-29-24-7-51-27-37-18-50Z" />
    {/* Arabia */}
    <path d="m406 223 38 9 21 30-26 25-29-13-11-28Z" />
    {/* South-East Asia and Australia */}
    <path d="m475 234 30-19 34 15-5 27-32 9Zm36 100 47-12 30 27-15 42-43 18-35-29Z" />
    {/* Greenland */}
    <path d="m187 72 33-24 29 15-9 35-35 12Z" />
  </>
);

export function Globe() {
  return (
    <div
      className="relative mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center"
      role="img"
      aria-label="Въртящ се глобус, свързващ ключови бизнес центрове в региона MENA"
    >
      <div className="absolute inset-[9%] rounded-full bg-emerald-500/20 blur-[55px]" />
      <svg viewBox="0 0 600 600" className="relative h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="globe-ocean" cx="35%" cy="28%" r="75%">
            <stop offset="0" stopColor="#123e38" />
            <stop offset="0.48" stopColor="#06241f" />
            <stop offset="0.82" stopColor="#020d0c" />
            <stop offset="1" stopColor="#010605" />
          </radialGradient>
          <linearGradient id="globe-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe56a" />
            <stop offset="0.45" stopColor="#e9b91e" />
            <stop offset="1" stopColor="#9b6305" />
          </linearGradient>
          <linearGradient id="globe-grid" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#6ee7b7" stopOpacity="0.55" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0.12" />
          </linearGradient>
          <radialGradient id="globe-shade" cx="29%" cy="23%" r="78%">
            <stop offset="0.38" stopColor="white" stopOpacity="0" />
            <stop offset="0.78" stopColor="#001b16" stopOpacity="0.18" />
            <stop offset="1" stopColor="#000" stopOpacity="0.72" />
          </radialGradient>
          <filter id="globe-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="marker-glow" x="-300%" y="-300%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="globe-sphere"><circle cx="300" cy="300" r="224" /></clipPath>
        </defs>

        {/* Atmospheric rim and orbit */}
        <circle cx="300" cy="300" r="229" fill="none" stroke="#10b981" strokeOpacity="0.3" strokeWidth="12" filter="url(#globe-glow)" />
        <ellipse cx="300" cy="300" rx="280" ry="94" fill="none" stroke="#d9aa16" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="9 12" transform="rotate(-17 300 300)">
          <animateTransform attributeName="transform" type="rotate" from="-17 300 300" to="343 300 300" dur="28s" repeatCount="indefinite" />
        </ellipse>

        <circle cx="300" cy="300" r="224" fill="url(#globe-ocean)" stroke="#34d399" strokeWidth="2" />

        <g clipPath="url(#globe-sphere)">
          {/* Geographic grid */}
          <g fill="none" stroke="url(#globe-grid)" strokeWidth="1.15">
            <ellipse cx="300" cy="300" rx="224" ry="67" />
            <ellipse cx="300" cy="300" rx="224" ry="132" />
            <ellipse cx="300" cy="300" rx="79" ry="224" />
            <ellipse cx="300" cy="300" rx="158" ry="224" />
            <path d="M76 300h448" />
          </g>

          {/* The repeated map slides behind the spherical mask for a seamless rotation. */}
          <g fill="url(#globe-land)" stroke="#fff2a6" strokeOpacity="0.36" strokeWidth="1.2">
            {landShapes}
            <g transform="translate(600 0)">{landShapes}</g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-600 0" dur="18s" repeatCount="indefinite" />
          </g>

          {/* Curved network routes */}
          <g fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" opacity="0.75">
            <path d="M344 258Q410 190 469 246" strokeDasharray="5 7" />
            <path d="M344 258Q283 183 214 213" strokeDasharray="5 7" />
            <path d="M344 258Q390 314 435 349" strokeDasharray="5 7" />
          </g>

          <circle cx="300" cy="300" r="224" fill="url(#globe-shade)" />
          <ellipse cx="236" cy="196" rx="82" ry="38" fill="white" opacity="0.08" transform="rotate(-31 236 196)" />
        </g>

        {/* MENA business hubs */}
        <g fill="#facc15" stroke="#fff7c2" strokeWidth="2" filter="url(#marker-glow)">
          <circle cx="344" cy="258" r="6"><animate attributeName="r" values="5;9;5" dur="2.2s" repeatCount="indefinite" /></circle>
          <circle cx="365" cy="252" r="4"><animate attributeName="opacity" values=".45;1;.45" dur="1.8s" repeatCount="indefinite" /></circle>
          <circle cx="326" cy="247" r="4"><animate attributeName="opacity" values="1;.4;1" dur="2.6s" repeatCount="indefinite" /></circle>
        </g>

        <circle cx="300" cy="300" r="224" fill="none" stroke="#34d399" strokeWidth="3" filter="url(#globe-glow)" />
      </svg>
    </div>
  );
}
