import React from "react";

interface OnePieceBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Each layer is drawn wider than the container so the horizontal drift never
 * exposes an edge, and each gets its own silhouette so the layers read as
 * separate water rather than one blob.
 */
const WAVES = [
  {
    opacity: 0.35,
    height: "34%",
    duration: "13s",
    delay: "0s",
    drift: "2.5%",
    d: "M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z",
  },
  {
    opacity: 0.55,
    height: "26%",
    duration: "9s",
    delay: "-2s",
    drift: "-3.5%",
    d: "M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,256C672,267,768,245,864,224C960,203,1056,181,1152,192C1248,203,1344,245,1392,266.7L1440,288L1440,320L0,320Z",
  },
  {
    opacity: 0.8,
    height: "18%",
    duration: "7s",
    delay: "-4s",
    drift: "4%",
    d: "M0,288L40,277.3C80,267,160,245,240,250.7C320,256,400,288,480,293.3C560,299,640,277,720,266.7C800,256,880,256,960,266.7C1040,277,1120,299,1200,298.7C1280,299,1360,277,1400,266.7L1440,256L1440,320L0,320Z",
  },
];

export function OnePieceBackground({
  children,
  className = "",
}: OnePieceBackgroundProps) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-amber-300 via-orange-500 via-40% to-blue-950" />

      {/* Sun, sitting just above the horizon the wave stack establishes. */}
      <div className="absolute left-1/2 top-[26%] aspect-square w-[clamp(140px,26%,300px)] -translate-x-1/2 rounded-full bg-amber-200/30 blur-[60px]" />
      <div className="absolute left-1/2 top-[34%] aspect-square w-[clamp(56px,11%,150px)] -translate-x-1/2 rounded-full bg-amber-100/90 blur-[2px]" />

      {/* Haze, sized relative to the box so it scales with any height. */}
      <div className="absolute left-[15%] top-[12%] h-[30%] w-[30%] rounded-full bg-white/15 blur-[70px]" />
      <div className="absolute right-[12%] top-[22%] h-[24%] w-[24%] rounded-full bg-rose-300/20 blur-[60px]" />

      <div className="absolute inset-x-0 bottom-0 top-1/3">
        {WAVES.map((wave, i) => (
          <div
            key={i}
            className="g5-wave absolute bottom-0 left-[-8%] w-[116%]"
            style={{
              height: wave.height,
              ["--g5-drift" as string]: wave.drift,
              animationDuration: wave.duration,
              animationDelay: wave.delay,
            }}
          >
            <svg
              viewBox="0 0 1440 320"
              className="absolute bottom-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path fill="#1e3a8a" fillOpacity={wave.opacity} d={wave.d} />
            </svg>
          </div>
        ))}
      </div>

      <div className="relative z-10 h-full">{children}</div>

      <style>{`
        .g5-wave {
          animation-name: g5-wave-drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        @keyframes g5-wave-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(var(--g5-drift), -6%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .g5-wave { animation: none; }
        }
      `}</style>
    </div>
  );
}
