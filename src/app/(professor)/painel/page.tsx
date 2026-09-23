import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";
import { Button } from "@/components/professor/ui";
import { GameList } from "@/components/professor/game-list";
import { listGamesForTeacher } from "@/db/queries/teacher-games";
import { getCurrentTeacher } from "@/lib/auth";
import { criarJogoAction, sairAction } from "../actions";

export const metadata: Metadata = { title: "Painel" };

/**
 * Painel do professor (seção 5.1 do descritivo).
 *
 * Nada aqui lê a sessão no topo: com Cache Components, um `await` de sessão no
 * nível da página seguraria a tela inteira atrás do request. O cabeçalho é
 * estático e a lista entra em streaming.
 */
export default function PainelPage() {
  return (
    <>
      <Starfield />
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase">
              Suas aulas
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">Painel</h1>
          </div>

          <div className="flex items-center gap-2">
            <form action={sairAction}>
              <Button type="submit">Sair</Button>
            </form>
            <form action={criarJogoAction}>
              <Button type="submit" variant="primary">
                <Plus aria-hidden className="size-4" />
                Nova aula
              </Button>
            </form>
          </div>
        </header>

        <div className="mt-8">
          <Suspense fallback={<ListSkeleton />}>
            <Games />
          </Suspense>
        </div>
      </main>
    </>
  );
}

async function Games() {
  const teacher = await getCurrentTeacher();
  const list = await listGamesForTeacher(teacher.id);

  if (list.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line px-6 py-14 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Nenhuma aula por aqui ainda
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          Comece por um tema — uma pergunta que você gostaria que a turma
          levasse para casa — e monte as missões a partir dele.
        </p>
        <form action={criarJogoAction} className="mt-6">
          <Button type="submit" variant="primary">
            <Plus aria-hidden className="size-4" />
            Criar a primeira aula
          </Button>
        </form>
      </div>
    );
  }

  return <GameList games={list} />;
}

function ListSkeleton() {
  return (
    <ul className="flex animate-pulse flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-28 rounded-card bg-night-850" />
      ))}
    </ul>
  );
}

/** Link para o painel a partir de outras telas do professor. */
export function PainelLink() {
  return (
    <Link href="/painel" className="text-sm text-ink-muted hover:text-ink">
      Painel
    </Link>
  );
}
