import { createElement } from "react";

/**
 * O selo de missão (a "estrela-bússola" de `app/icon.svg`), redesenhado como
 * elemento gerável por `next/og` (Satori). Usado para gerar PNGs sob demanda:
 * o ícone para tela inicial do iOS e os dois tamanhos do manifesto PWA.
 *
 * `createElement` em vez de JSX de propósito: este arquivo é `.ts`, não
 * `.tsx`, para poder ser importado tanto de `apple-icon.tsx` quanto do Route
 * Handler `manifest-icon/route.ts` — Route Handlers só existem como
 * `route.ts`/`route.js` na convenção do Next, nunca `.tsx`.
 */

const NIGHT = "#14101f";
const EMBER = "#f5b950";

export function brandIcon(size: number) {
  // 62%: dá folga para o corte redondo que Android/iOS aplicam a ícones de
  // instalação (maskable), sem o desenho ficar minúsculo nos tamanhos maiores.
  const mark = Math.round(size * 0.62);

  return createElement(
    "div",
    {
      style: {
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: NIGHT,
      },
    },
    createElement(
      "svg",
      { width: mark, height: mark, viewBox: "0 0 64 64" },
      createElement("path", {
        d: "M32 9 L37.5 26.5 L55 32 L37.5 37.5 L32 55 L26.5 37.5 L9 32 L26.5 26.5 Z",
        fill: EMBER,
      }),
      createElement("circle", { cx: 32, cy: 32, r: 4.5, fill: NIGHT }),
    ),
  );
}
