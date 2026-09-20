import type { Variants } from "motion/react";

/**
 * Vocabulário único de movimento da jornada.
 *
 * Todas as telas usam estes presets para o ritmo ser o mesmo do início ao fim
 * — entrada escalonada, subida curta, mesma curva. Cada função recebe o valor
 * de `useReducedMotion()`: com movimento reduzido, sobra só um fade rápido e
 * sem deslocamento, que é o que a preferência do sistema pede.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;

type Reduced = boolean | null;

/** Contêiner que escalona a entrada dos filhos. */
export function staggerGroup(reduced: Reduced, gap = 0.06, delay = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : gap,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };
}

/** Item que sobe e aparece. */
export function rise(reduced: Reduced): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.15 : 0.45, ease: EASE_OUT },
    },
  };
}

/** Linha que se desenha da esquerda para a direita. */
export function drawLine(reduced: Reduced): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 },
    show: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: reduced ? 0.15 : 0.5, ease: EASE_OUT },
    },
  };
}

/** Linha vertical que cresce de cima para baixo (diagrama da conclusão). */
export function growDown(reduced: Reduced): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { scaleY: 0, opacity: 0 },
    show: {
      scaleY: 1,
      opacity: 1,
      transition: { duration: reduced ? 0.15 : 0.35, ease: EASE_OUT },
    },
  };
}

/** Selo que "estala" ao aparecer. */
export function pop(reduced: Reduced): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 },
    show: {
      opacity: 1,
      scale: 1,
      transition: reduced ? { duration: 0.15 } : SPRING,
    },
  };
}

/** Resposta ao toque, para botões e cartões. */
export function tap(reduced: Reduced) {
  return reduced ? undefined : { scale: 0.975 };
}
