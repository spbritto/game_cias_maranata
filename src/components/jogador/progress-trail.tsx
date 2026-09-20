import { cn } from "@/lib/utils";

/**
 * Progresso como trilha de pontos — o "● ● ● ○ ○" da seção 14 do descritivo.
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
  return (
    <div className="flex items-center gap-3">
      <ol
        className="flex flex-1 items-center gap-1.5"
        aria-label={`Progresso: missão ${current + 1} de ${total}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={i}
              aria-hidden
              className={cn(
                "h-1.5 flex-1 rounded-pill transition-colors duration-500",
                done && "bg-ember-500",
                active && "bg-aurora-400",
                !done && !active && "bg-night-700",
              )}
            />
          );
        })}
      </ol>
      <span className="shrink-0 text-xs font-medium tabular-nums text-ink-subtle">
        {current + 1}/{total}
      </span>
    </div>
  );
}
