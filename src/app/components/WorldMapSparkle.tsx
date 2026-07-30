// Sparkle dots positioned as % of the world SVG (equirectangular, 2000×857 viewBox)
// x = (lon + 180) / 360 * 100   y = (90 - lat) / 180 * 100
const DOTS = [
  // [left%, top%, delay_ms, size_px, label?]
  { x: 29.4, y: 27.2, delay: 0,    size: 3, city: "Nueva York" },
  { x: 19.2, y: 34.5, delay: 600,  size: 2.5 },
  { x: 37.5, y: 63.1, delay: 1200, size: 2.5, city: "São Paulo" },
  { x: 49.9, y: 21.4, delay: 300,  size: 3, city: "Londres" },
  { x: 48.6, y: 28.1, delay: 900,  size: 2 },
  { x: 54.6, y: 68.7, delay: 400,  size: 2.5 },
  { x: 60.4, y: 19.0, delay: 700,  size: 2 },
  { x: 65.3, y: 36.3, delay: 200,  size: 3, city: "Dubai" },
  { x: 70.4, y: 39.4, delay: 1000, size: 2.5, city: "Mumbai" },
  { x: 75.2, y: 29.4, delay: 500,  size: 2 },
  { x: 83.8, y: 32.2, delay: 800,  size: 2.5 },
  { x: 88.8, y: 30.3, delay: 100,  size: 3, city: "Tokio" },
  { x: 92.0, y: 69.4, delay: 1100, size: 2.5, city: "Sídney" },
  { x: 67.2, y: 52.4, delay: 650,  size: 2 },
  { x: 52.2, y: 48.6, delay: 350,  size: 2 },
];

// Valparaíso, Chile: lon=-71.6, lat=-33
const VALPO = { x: 30.2, y: 68.3 };

export function WorldMapSparkle() {
  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.15; transform: scale(0.7); }
          50%       { opacity: 1;    transform: scale(1.25); }
        }
        @keyframes valpo-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.9; }
          50%       { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes valpo-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(4);   opacity: 0;   }
        }
      `}</style>

      {/* World map */}
      <img
        src="/world.svg"
        alt=""
        className="w-full h-auto block"
        style={{ opacity: 0.55, filter: "brightness(0.55) saturate(0.4)" }}
      />

      {/* Sparkle dots */}
      {DOTS.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#2ECC71",
            boxShadow: "0 0 4px 1px rgba(46,204,113,0.6)",
            transform: "translate(-50%, -50%)",
            animation: `sparkle 2.8s ease-in-out ${d.delay}ms infinite`,
          }}
        />
      ))}

      {/* Valparaíso — pulsing ring + solid dot */}
      <span
        style={{
          position: "absolute",
          left: `${VALPO.x}%`,
          top: `${VALPO.y}%`,
          transform: "translate(-50%, -50%)",
          width: 12,
          height: 12,
        }}
      >
        {/* outer ring */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid #2ECC71",
            animation: "valpo-ring 1.8s ease-out infinite",
          }}
        />
        {/* inner dot */}
        <span
          style={{
            position: "absolute",
            inset: "25%",
            borderRadius: "50%",
            background: "#2ECC71",
            boxShadow: "0 0 6px 2px rgba(46,204,113,0.8)",
            animation: "valpo-pulse 1.8s ease-in-out infinite",
          }}
        />
      </span>

      {/* Tooltip */}
      <div
        style={{
          position: "absolute",
          left: `${VALPO.x}%`,
          top: `${VALPO.y}%`,
          transform: "translate(-50%, calc(-100% - 18px))",
          pointerEvents: "none",
        }}
        className="bg-[#1B1B1B] border border-[#2ECC71]/40 text-[#F2F2F0] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
      >
        Estamos aquí — Valparaíso
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: -5,
            transform: "translateX(-50%)",
            width: 8,
            height: 8,
            background: "#1B1B1B",
            border: "1px solid rgba(46,204,113,0.4)",
            borderTop: "none",
            borderLeft: "none",
            rotate: "45deg",
          }}
        />
      </div>
    </div>
  );
}
