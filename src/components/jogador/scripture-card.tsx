import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bloco de texto bíblico. Tem tratamento visual próprio de propósito: na
 * jornada ele é o ponto de chegada da reflexão, não mais um parágrafo.
 */
export function ScriptureCard({
  reference,
  text,
  glow,
}: {
  reference: string;
  text?: string;
  /** Brilho âmbar estático — para quando o versículo é o centro da tela. */
  glow?: boolean;
}) {
  return (
    <figure
      className={cn(
        "rounded-card border border-ember-500/25 bg-ember-500/[0.07] p-5",
        glow && "glow-ember",
      )}
    >
      <blockquote className="text-[0.975rem] leading-relaxed text-ink">
        {text ? `“${text}”` : null}
      </blockquote>
      <figcaption className="mt-3 flex items-center gap-2 text-sm font-semibold text-ember-400">
        <BookOpen aria-hidden className="size-4 shrink-0" />
        {reference}
      </figcaption>
    </figure>
  );
}
