export default function NexusWordmark({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 360"
      className={className}
      role="img"
      aria-label="NEXUS"
    >
      <defs>
        <linearGradient id="nexusWordmarkEmerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FFFE1" />
          <stop offset="18%" stopColor="#33F5B2" />
          <stop offset="55%" stopColor="#00C982" />
          <stop offset="100%" stopColor="#00895C" />
        </linearGradient>
        <filter id="nexusWordmarkGlow" x="-80%" y="-120%" width="260%" height="340%">
          <feGaussianBlur stdDeviation="24" result="blur1" />
          <feFlood floodColor="#00E98C" floodOpacity="0.75" result="flood1" />
          <feComposite in="flood1" in2="blur1" operator="in" result="glow1" />
          <feGaussianBlur stdDeviation="10" result="blur1b" />
          <feFlood floodColor="#33FFC2" floodOpacity="0.6" result="flood1b" />
          <feComposite in="flood1b" in2="blur1b" operator="in" result="glow1b" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur2" />
          <feFlood floodColor="#00FFC2" floodOpacity="0.9" result="flood2" />
          <feComposite in="flood2" in2="blur2" operator="in" result="glow2" />
          <feMerge>
            <feMergeNode in="glow1" />
            <feMergeNode in="glow1b" />
            <feMergeNode in="glow2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        fill="none"
        stroke="#00E98C"
        strokeWidth="30"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.55"
        filter="url(#nexusWordmarkGlow)"
      >
        <path d="M85 275 V85 L275 275 V85" />
        <path d="M370 85 H565 M370 85 V275 M370 180 H545 M370 275 H565" />
        <path d="M655 85 L845 275 M845 85 L655 275" />
        <path d="M935 85 V215 Q935 275 995 275 H1055 Q1115 275 1115 215 V85" />
        <path d="M1325 95 H1210 Q1150 95 1150 145 Q1150 190 1208 190 H1272 Q1330 190 1330 235 Q1330 275 1274 275 H1150" />
      </g>

      <g
        fill="none"
        stroke="url(#nexusWordmarkEmerald)"
        strokeWidth="20"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M85 275 V85 L275 275 V85" />
        <path d="M370 85 H565 M370 85 V275 M370 180 H545 M370 275 H565" />
        <path d="M655 85 L845 275 M845 85 L655 275" />
        <path
          d="M935 85 V215 Q935 275 995 275 H1055 Q1115 275 1115 215 V85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1325 95 H1210 Q1150 95 1150 145 Q1150 190 1208 190 H1272 Q1330 190 1330 235 Q1330 275 1274 275 H1150"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g
        fill="none"
        stroke="#062C22"
        strokeOpacity="0.80"
        strokeWidth="11"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M85 275 V85 L275 275 V85" />
        <path d="M370 85 H565 M370 85 V275 M370 180 H545 M370 275 H565" />
        <path d="M655 85 L845 275 M845 85 L655 275" />
        <path
          d="M935 85 V215 Q935 275 995 275 H1055 Q1115 275 1115 215 V85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1325 95 H1210 Q1150 95 1150 145 Q1150 190 1208 190 H1272 Q1330 190 1330 235 Q1330 275 1274 275 H1150"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g
        fill="none"
        stroke="#89FFE0"
        strokeWidth="2.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.96"
      >
        <path d="M85 275 V85 L275 275 V85" />
        <path d="M370 85 H565 M370 85 V275 M370 180 H545 M370 275 H565" />
        <path d="M655 85 L845 275 M845 85 L655 275" />
        <path
          d="M935 85 V215 Q935 275 995 275 H1055 Q1115 275 1115 215 V85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1325 95 H1210 Q1150 95 1150 145 Q1150 190 1208 190 H1272 Q1330 190 1330 235 Q1330 275 1274 275 H1150"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
