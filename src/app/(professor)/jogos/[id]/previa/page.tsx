import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GameRuntime } from "@/components/jogador/game-runtime";
import { getGameDraft } from "@/db/queries/teacher-games";
import { getCurrentTeacher } from "@/lib/auth";
import type { PlayableGame } from "@/lib/game";
import { conclusionSchema, stepDataSchema } from "@/lib/schemas/step";

export const metadata: Metadata = { title: "Prévia" };

type Props = { params: Promise<{ id: string }> };

/**
 * Prévia da aula ainda em rascunho.
 *
 * Usa o MESMO `GameRuntime` do adolescente, não uma imitação — é o que garante
 * que o que o professor vê aqui é o que a turma vai ver. Só o que já está
 * completo entra: missão pela metade é omitida com um aviso, em vez de
 * quebrar a prévia.
 */
export default function PreviaPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: Props) {
  const { id } = await params;
  const teacher = await getCurrentTeacher();
  const record = await getGameDraft(id, teacher.id);
  if (!record) notFound();

  const ready = record.steps.flatMap((step) => {
    const parsed = stepDataSchema.safeParse(strip(step.data));
    return parsed.success ? [{ id: step.id, data: parsed.data }] : [];
  });

  const omitted = record.steps.length - ready.length;
  const conclusion = conclusionSchema.safeParse(strip(record.conclusion));

  const game: PlayableGame = {
    slug: `previa-${record.id}`,
    title: record.info.title || "Sem título",
    theme: record.info.theme || "Prévia",
    description: record.info.description || null,
    mainScripture: record.info.mainScripture || null,
    steps: ready,
    conclusion: conclusion.success ? conclusion.data : null,
  };

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-line bg-night-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-2 px-5 py-3">
          <Link
            href={`/jogos/${record.id}/editar`}
            className="inline-flex min-h-touch items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Voltar ao editor
          </Link>
          <span className="text-xs font-semibold tracking-[0.18em] text-ember-400 uppercase">
            Prévia
          </span>
        </div>

        {omitted > 0 ? (
          <p className="mx-auto w-full max-w-md px-5 pb-3 text-xs text-ink-subtle">
            {omitted === 1
              ? "1 missão ainda incompleta não aparece aqui."
              : `${omitted} missões ainda incompletas não aparecem aqui.`}
          </p>
        ) : null}
      </div>

      {ready.length ? (
        <GameRuntime game={game} />
      ) : (
        <main className="mx-auto flex w-full max-w-md flex-col gap-3 px-5 py-20 text-center">
          <h1 className="text-xl font-semibold text-ink">
            Nada para mostrar ainda
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Complete ao menos uma missão — pergunta e alternativas — e ela
            aparece aqui exatamente como o adolescente vai ver.
          </p>
        </main>
      )}
    </>
  );
}

/** Remove campos vazios para o esquema estrito ver "ausente", não "". */
function strip(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(strip);
  if (typeof value !== "object" || value === null) return value;

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      const trimmed = entry.trim();
      if (trimmed) out[key] = trimmed;
    } else {
      out[key] = strip(entry);
    }
  }
  return out;
}
