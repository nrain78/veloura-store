// Kapron ki simple SVG illustrations (jab tak asli photos nahi aati)
const dim = "rgba(0,0,0,0.08)";
const dot = "rgba(0,0,0,0.4)";

const shapes = {
  tshirt: (
    <>
      <path d="M60 40 L85 30 Q100 46 115 30 L140 40 L172 72 L150 94 L140 82 L140 170 L60 170 L60 82 L50 94 L28 72 Z" />
      <path d="M84 31 Q100 52 116 31" fill="none" strokeWidth="3" />
    </>
  ),
  hoodie: (
    <>
      <path d="M62 50 L84 40 Q100 56 116 40 L138 50 L174 142 L152 152 L140 112 L140 172 L60 172 L60 112 L48 152 L26 142 Z" />
      <path d="M78 42 Q100 6 122 42 Q100 62 78 42 Z" />
      <path d="M72 130 L128 130 L134 158 L66 158 Z" fill={dim} />
      <path d="M94 62 L92 88 M106 62 L108 88" fill="none" />
    </>
  ),
  jeans: (
    <>
      <path d="M60 28 L140 28 L148 176 L108 176 L100 84 L92 176 L52 176 Z" />
      <path d="M60 44 L140 44 M100 44 L100 84" fill="none" />
    </>
  ),
  jacket: (
    <>
      <path d="M56 42 L84 32 L100 52 L116 32 L144 42 L178 150 L154 158 L144 112 L144 174 L56 174 L56 112 L46 158 L22 150 Z" />
      <path d="M100 52 L100 174" fill="none" />
      <path d="M84 32 L100 52 L90 66 L72 50 Z M116 32 L100 52 L110 66 L128 50 Z" fill={dim} />
    </>
  ),
  kurta: (
    <>
      <path d="M64 26 L86 20 Q100 36 114 20 L136 26 L162 64 L144 78 L138 68 L142 188 L58 188 L62 68 L56 78 L38 64 Z" />
      <path d="M100 34 L100 92" fill="none" />
      <circle cx="100" cy="48" r="2.5" fill={dot} stroke="none" />
      <circle cx="100" cy="64" r="2.5" fill={dot} stroke="none" />
      <circle cx="100" cy="80" r="2.5" fill={dot} stroke="none" />
      <path d="M62 150 L138 150" fill="none" />
    </>
  ),
  dress: (
    <>
      <path d="M80 22 L92 22 Q100 44 108 22 L120 22 L124 72 L152 184 L48 184 L76 72 Z" />
      <path d="M76 72 L124 72" fill="none" />
    </>
  ),
  cap: (
    <>
      <path d="M40 124 Q40 62 100 62 Q160 62 160 124 Z" />
      <path d="M36 124 Q100 112 178 132 Q160 146 100 138 Q60 134 36 124 Z" fill={dim} />
      <circle cx="100" cy="62" r="5" />
    </>
  ),
};

export default function GarmentArt({ type = "tshirt", color = "#d6d3d1", className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={type}>
      <g fill={color} stroke="rgba(0,0,0,0.28)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {shapes[type] || shapes.tshirt}
      </g>
    </svg>
  );
}
