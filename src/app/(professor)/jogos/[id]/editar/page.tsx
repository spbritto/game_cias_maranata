import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Starfield } from "@/components/jogador/starfield";
import { GameEditor } from "@/components/professor/game-editor";
import { getGameDraft } from "@/db/queries/teacher-games";
import { getCurrentTeacher } from "@/lib/auth";

export const metadata: Metadata = { title: "Editar aula" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gerada?: string }>;
};

export default function EditarPage({ params, searchParams }: Props) {
  return (
    <>
      <Starfield />
      <Suspense fallback={<EditorSkeleton />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Editor({ params, searchParams }: Props) {
  const { id } = await params;
  const { gerada } = await searchParams;
  // Sessão exigida mesmo sem filtrar por dono: as aulas são compartilhadas
  // entre professores, mas continuam fechadas para quem não entrou.
  await getCurrentTeacher();

  const draft = await getGameDraft(id);
  if (!draft) notFound();

  return <GameEditor record={draft} generated={gerada === "1"} />;
}

function EditorSkeleton() {
  return (
    <main className="mx-auto w-full max-w-2xl animate-pulse px-5 py-10">
      <div className="h-8 w-48 rounded-field bg-night-800" />
      <div className="mt-8 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-card bg-night-850" />
        ))}
      </div>
    </main>
  );
}
