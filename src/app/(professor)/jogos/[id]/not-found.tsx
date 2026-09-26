import Link from "next/link";
import { Compass } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";

/**
 * Cobre `editar` e `previa`: as duas chamam `notFound()` quando o jogo não
 * existe ou não pertence ao professor logado — as duas situações somam a
 * mesma mensagem de propósito, para não revelar qual delas é o caso.
 */
export default function GameNotFound() {
  return (
    <>
      <Starfield />
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-5 px-5 text-center">
        <Compass aria-hidden className="size-10 text-ember-400" />
        <h1 className="text-2xl font-semibold text-ink">
          Essa aula não está aqui
        </h1>
        <p className="leading-relaxed text-ink-muted">
          Ou ela não existe mais, ou pertence a outra conta de professor.
        </p>
        <Link
          href="/painel"
          className="inline-flex min-h-touch items-center justify-center rounded-pill border border-line bg-surface-raised px-6 text-sm font-semibold text-ink hover:border-line-strong"
        >
          Voltar ao painel
        </Link>
      </main>
    </>
  );
}
