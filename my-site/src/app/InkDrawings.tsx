export function WanderingArrowDrawing({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 65"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 51c20 8 45-3 34-16-8-9-22 4-10 11 16 9 38-7 45-31M62 20l14-9 3 17" />
      </g>
    </svg>
  );
}

export function GlobeDrawing({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M40 6C18 5 7 21 7 40c0 20 14 34 33 34 21 0 34-15 34-34C74 19 59 7 40 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m22 12 5 12-8 8 8 9 12-3 4 12-4 17M58 13 46 27l11 7 12-2M8 45l12 5-2 13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M2 19C-2 1 38-1 66 16s27 31 9 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

export function GliderDrawing({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 100"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M25 36C45 2 113 1 149 29L146 38C111 17 62 16 28 44Z" />
        <path d="M48 18 47 32M70 11 69 25M94 10 94 25M118 16 117 29" />
        <path d="m29 44 55 32 62-38M48 32l36 44 10-51M117 29 84 76" />
        <path d="M86 77c-7 1-11 7-8 11l13 1 5-10M91 74c5-3 6-8 2-9-5-1-6 3-4 6M78 88l-11 6 18-1" />
        <path
          d="M5 63c15-7 21 2 32-1M11 77c16-6 25 1 34-3M123 66c17 0 15 12 32 10"
          strokeDasharray="3 5"
        />
      </g>
    </svg>
  );
}

export function ProjectDrawing({ kind }: { kind: string }) {
  const paths: Record<string, string[]> = {
    carbon: [
      "M48 66C21 52 19 25 64 15c6 29-1 49-16 51Z",
      "M34 78 57 29M44 57l-8-13M49 47l13-3",
      "M65 59h18v18H62V65M68 65h8M68 71h8",
    ],
    grey: [
      "m17 57 11-27 19 6 9 16 23 9c10 3 13 12 7 16H17Z",
      "M17 67c27 5 52 1 72 4M34 38l13 3M37 45l14 3M41 52l15 2M23 53l15 9 22-4",
    ],
    prizesole: [
      "m34 23 31 1-3 28-13 11-14-11ZM34 29H22c-2 15 4 20 14 20M65 30h12c1 14-5 20-15 20",
      "m49 63-1 13M35 79l28-1M13 16l5 4M81 15l-4 6M80 55l6 3",
    ],
    verdra: [
      "M19 32h61v40H18ZM25 39h47v23H26ZM12 77h74l-5 5H16Z",
      "M49 58c-13-4-15-15 8-17 2 10-2 15-8 17ZM45 62l10-16",
    ],
  };
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {(paths[kind] || paths.verdra).map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

export function PaperPlaneDrawing({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 110"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m67 43 91-30-34 65-20-25-26 13 4-21 76-32-54 40-2 24-12-15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 94c34 3 65-13 50-28-10-11-31-3-19 10 10 9 23 3 36-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="4 7"
      />
    </svg>
  );
}

export function SunDrawing({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M30 32c15-15 39-6 41 13 4 23-16 33-33 25-20-5-20-24-8-38Z"
        fill="#f5ee80"
      />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="m49 7-1 12M76 17l-8 10M90 44l-13 2M83 73l-11-8M57 89l-3-12M25 84l7-11M9 57l12-4M15 24l13 8" />
        <path d="M37 44v3M57 43v3M36 56q12 13 25-1" />
      </g>
    </svg>
  );
}

export function EarthSketch({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 150"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M71 12c-39-3-61 30-57 64 1 38 39 65 74 58 43-4 60-39 49-77-9-28-32-43-66-45Z"
        fill="#438cdd"
        stroke="#292e32"
        strokeWidth="2"
      />
      <path
        d="m42 23 18 10-6 19-19 7 9 19-11 7-14-18 7-25ZM88 16l12 11-7 17-16-4-3-15ZM94 66l28-7 12 19-10 23-22-8-7-13ZM56 86l17 7 11 19-7 17-18-11-9-21Z"
        fill="#398652"
      />
      <path
        d="M4 109c-17 26 52 36 102 13 45-21 58-43 34-42"
        stroke="#8650a0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
    </svg>
  );
}
