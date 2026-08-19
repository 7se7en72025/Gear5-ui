import React from "react";

interface OnePieceBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function OnePieceBackground({
  children,
  className = "",
}: OnePieceBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-pink-500 to-blue-900" />

      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: `${30 + i * 10}%`,
              animation: `wave ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <svg
              viewBox="0 0 1440 320"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <path
                fill={`rgba(30, 58, 138, ${0.4 + i * 0.2})`}
                d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="absolute top-20 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-1/3 w-24 h-24 bg-yellow-300/30 rounded-full blur-2xl animate-pulse" />

      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}