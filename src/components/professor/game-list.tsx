"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { Button, StatusBadge } from "./ui";
import type { GameSummary } from "@/db/queries/teacher-games";
import { useOrigin } from "@/lib/use-origin";
import {
  duplicarJogoAction,
  encerrarJogoAction,
  excluirJogoAction,
  reabrirJogoAction,
} from "@/app/(professor)/actions";

const GENERIC_ERROR = "Algo deu errado. Tente de novo em instantes.";

export function GameList({ games }: { games: GameSummary[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {games.map((game) => (
        <li key={game.id}>
          <GameRow game={game} />
        </li>
      ))}
    </ul>
  );
}

function GameRow({ game }: { game: GameSummary }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * Toda ação passa por aqui. `redirect()` dentro de uma Server Action (usado
   * por duplicar e excluir) não é afetado por este try/catch — ele só
   * intercepta uma falha de verdade (rede caída, banco fora do ar).
   */
  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError(GENERIC_ERROR);
      }
    });
  }

  return (
    <article className="rounded-card border border-line bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">
              {game.title || "Sem título"}
            </h2>
            <StatusBadge status={game.status} />
          </div>
          <p className="mt-1 text-sm text-ink-subtle">
            {game.theme || "Sem tema"} ·{" "}
            {game.stepCount === 1 ? "1 missão" : `${game.stepCount} missões`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Mais ações"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted hover:border-line-strong hover:text-ink"
        >
          <MoreHorizontal aria-hidden className="size-5" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/jogos/${game.id}/editar`}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill border border-line bg-surface-overlay px-5 text-sm font-semibold text-ink hover:border-line-strong"
        >
          <Pencil aria-hidden className="size-4" />
          Editar
        </Link>

        {game.slug ? <ShareLink slug={game.slug} /> : null}
      </div>

      {open ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending}
              onClick={() => run(() => duplicarJogoAction(game.id))}
            >
              <Copy aria-hidden className="size-4" />
              Duplicar
            </Button>

            {game.status === "published" ? (
              <Button
                disabled={pending}
                onClick={() => run(() => encerrarJogoAction(game.id))}
              >
                <Power aria-hidden className="size-4" />
                Encerrar
              </Button>
            ) : null}

            {game.status === "closed" ? (
              <Button
                disabled={pending}
                onClick={() => run(() => reabrirJogoAction(game.id))}
              >
                <Power aria-hidden className="size-4" />
                Reabrir
              </Button>
            ) : null}

            <DeleteButton game={game} pending={pending} run={run} />
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-center gap-2 text-sm text-red-300"
            >
              <AlertTriangle aria-hidden className="size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const origin = useOrigin();
  const url = `${origin}/jogar/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de área de transferência: o link continua visível no
      // botão "Abrir", então não vale interromper com um erro.
    }
  }

  return (
    <>
      <Button onClick={copy}>
        {copied ? (
          <Check aria-hidden className="size-4 text-ember-400" />
        ) : (
          <Link2 aria-hidden className="size-4" />
        )}
        {copied ? "Link copiado" : "Copiar link"}
      </Button>

      <a
        href={`/jogar/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-5 text-sm font-semibold text-ink hover:border-line-strong"
      >
        <ExternalLink aria-hidden className="size-4" />
        Abrir
      </a>
    </>
  );
}

/**
 * Exclusão pede confirmação porque leva as missões junto e não tem volta.
 * `confirm()` nativo em vez de diálogo próprio: é uma ação rara, e o diálogo
 * do sistema já é acessível e familiar no celular.
 */
function DeleteButton({
  game,
  pending,
  run,
}: {
  game: GameSummary;
  pending: boolean;
  run: (action: () => Promise<void>) => void;
}) {
  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          `Excluir "${game.title}" e todas as suas missões? Isso não tem como desfazer.`,
        );
        if (ok) run(() => excluirJogoAction(game.id));
      }}
    >
      <Trash2 aria-hidden className="size-4" />
      Excluir
    </Button>
  );
}
