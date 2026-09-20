/**
 * Céu estrelado de fundo — o elemento visual que ancora o tema "noturno /
 * jornada" sem competir com o conteúdo.
 *
 * Posições geradas por um gerador com semente fixa, em nível de módulo: o
 * servidor e o cliente produzem exatamente o mesmo céu, então não há erro de
 * hidratação. O brilho é uma animação CSS de opacidade, o que custa quase nada
 * e é desligada pela regra global de `prefers-reduced-motion`.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(2026);

const STARS = Array.from({ length: 56 }, () => ({
  left: `${(random() * 100).toFixed(2)}%`,
  top: `${(random() * 100).toFixed(2)}%`,
  size: random() < 0.15 ? 3 : random() < 0.5 ? 2 : 1,
  delay: `${(random() * 6).toFixed(2)}s`,
  duration: `${(3 + random() * 4).toFixed(2)}s`,
  /* estrelas mais fracas em maior número: profundidade sem poluição */
  peak: (0.35 + random() * 0.55).toFixed(2),
}));

export function Starfield() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {STARS.map((star, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-night-100"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            ["--star-peak" as string]: star.peak,
          }}
        />
      ))}
    </div>
  );
}
