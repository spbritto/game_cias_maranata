"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Primitivas da área do professor.
 *
 * Escritas à mão em vez de shadcn/ui, que o plano previa: são cinco componentes
 * contra a máquina de geração e a árvore de dependências do shadcn, e assim
 * herdam direto os tokens da identidade noturna já usada pelo jogador.
 */

const fieldBase =
  "w-full rounded-field border border-line bg-surface-raised px-4 py-3 text-base text-ink transition-colors placeholder:text-ink-subtle focus:border-aurora-400 disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-muted">
        {label}
      </label>
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      {children(id)}
      {error ? <p className="text-xs text-ember-400">{error}</p> : null}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(fieldBase, "min-h-touch", className)}
    />
  );
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={cn(fieldBase, "resize-y", className)} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn(fieldBase, "min-h-touch", className)} />
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({
  variant = "ghost",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-touch items-center justify-center gap-2 rounded-pill px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-accent text-night-950 hover:bg-accent-soft",
        variant === "ghost" &&
          "border border-line bg-surface-raised text-ink hover:border-line-strong hover:bg-surface-overlay",
        variant === "danger" &&
          "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        className,
      )}
    />
  );
}

export function Card({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-card border border-line bg-surface-raised p-5",
        className,
      )}
    />
  );
}

const STATUS_STYLE = {
  draft: "border-night-600 text-ink-muted",
  published: "border-ember-500/50 bg-ember-500/10 text-ember-300",
  closed: "border-night-600 bg-night-800 text-ink-subtle",
} as const;

const STATUS_LABEL = {
  draft: "Rascunho",
  published: "Publicado",
  closed: "Encerrado",
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_LABEL }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-pill border px-3 py-1 text-xs font-semibold",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
