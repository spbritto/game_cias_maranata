"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SPRING } from "./motion-presets";
import { cn } from "@/lib/utils";

/**
 * Progresso como constelação: pontos ligados por uma linha que vai se acendendo.
 * É o "● ● ● ○ ○" da seção 14 do descritivo, com o ponto atual marcado por um
 * anel que desliza de um ponto ao outro a cada missão concluída.
 *
 * Deliberadamente não mostra pontuação nem percentual de acerto: a seção 17
 * proíbe transformar a experiência em placar.
 */
export function ProgressTrail({
  total,
  current,
}: {
  /** Quantidade de etapas. */
  total: number;
  /** Índice da etapa atual, base zero. */
  current: number;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      className="flex items-center gap-3"
      role="img"
      aria-label={`Missão ${current + 1} de ${total}`}
    >
      <div className="flex flex-1 items-center">
        {Array.from({ length: total }, (_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Fragment key={i}>
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1 transition-colors duration-700",
                    i <= current ? "bg-ember-500/70" : "bg-night-700",
                  )}
                />
              ) : null}

              <span
                aria-hidden
                className="relative flex size-4 shrink-0 items-center justify-center"
              >
                {/* o anel do ponto atual: um só elemento, que o Motion desloca
                    entre posições quando `current` muda */}
                {active ? (
                  <motion.span
                    layoutId="trail-ring"
                    transition={reduced ? { duration: 0 } : SPRING}
                    className="ring-pulse absolute inset-0 rounded-full border border-aurora-400/70"
                  />
                ) : null}

                <span
                  className={cn(
                    "size-2.5 rounded-full transition-all duration-500",
                    done && "bg-ember-400 shadow-[0_0_10px_var(--color-ember-500)]",
                    active && "bg-aurora-400",
                    !done && !active && "size-1.5 bg-night-600",
                  )}
                />
              </span>
            </Fragment>
          );
        })}
      </div>

      <span className="shrink-0 text-xs font-medium tabular-nums text-ink-subtle">
        {current + 1}/{total}
      </span>
    </div>
  );
}
