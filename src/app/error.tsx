"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";

/**
 * Limite de erro do app inteiro.
 *
 * Pega qualquer falha não tratada durante a renderização (não cobre erros
 * dentro de Server Actions chamadas manualmente — esses já são tratados no
 * componente que chama, com try/catch e uma mensagem inline). Sem este
 * arquivo, uma falha aqui cairia na tela padrão do Next, sem a identidade do
 * produto e sem texto em português.
 *
 * Precisa ser Client Component — é exigência do arquivo `error.tsx`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Só console: não há coleta de erros configurada neste projeto ainda.
    console.error(error);
  }, [error]);

  return (
    <>
      <Starfield />
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-5 px-5 text-center">
        <h1 className="text-2xl font-semibold text-ink">
          Algo não saiu como devia
        </h1>
        <p className="leading-relaxed text-ink-muted">
          Não conseguimos carregar esta página agora. Pode ser passageiro —
          vale tentar de novo.
        </p>

        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill bg-accent px-6 text-base font-semibold text-night-950 hover:bg-accent-soft"
        >
          <RotateCcw aria-hidden className="size-4" />
          Tentar de novo
        </button>
      </main>
    </>
  );
}
