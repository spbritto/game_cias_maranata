import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MoonStar } from "lucide-react";
import { GameRuntime } from "@/components/jogador/game-runtime";
import { getGameBySlug } from "@/db/queries/games";

type Props = { params: Promise<{ slug: string }> };

/**
 * Metadados vêm do servidor de propósito: é o que faz o link ganhar preview no
 * WhatsApp, que é como o professor compartilha (seção 12 do descritivo). Uma SPA
 * não conseguiria — foi o argumento decisivo pelo Next (seção 1.1 do plano).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGameBySlug(slug);

  if (!result) {
    return { title: "Missão não encontrada" };
  }

  const { game } = result;
  const description =
    game.description ?? `Uma jornada sobre ${game.theme.toLowerCase()}.`;

  return {
    title: game.title,
    description,
    openGraph: { title: game.title, description, type: "website" },
  };
}

/**
 * O slug só existe em tempo de requisição, então a leitura dele fica sob
 * Suspense: com Cache Components ligado, isso é o que permite a rota ter um
 * shell estático servido na hora enquanto o jogo chega em streaming. Sem o
 * limite, o Next recusa a rota inteira no build.
 */
export default function PlayPage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingShell />}>
      <GameContent params={params} />
    </Suspense>
  );
}

async function GameContent({ params }: Props) {
  const { slug } = await params;
  const result = await getGameBySlug(slug);

  if (!result) notFound();

  // Encerrado mantém o link vivo — quebrar uma URL já compartilhada no grupo
  // seria pior do que explicar que a missão acabou.
  if (result.status === "closed") {
    return <ClosedScreen title={result.game.title} />;
  }

  return <GameRuntime game={result.game} />;
}

/** Esqueleto do formato da tela inicial, para não haver salto de layout. */
function LoadingShell() {
  return (
    <main className="mx-auto w-full max-w-md px-5">
      <div className="flex min-h-dvh animate-pulse flex-col justify-center gap-8 py-12">
        <div className="flex flex-col gap-4">
          <div className="h-3 w-24 rounded-pill bg-night-800" />
          <div className="h-9 w-full rounded-field bg-night-800" />
          <div className="h-9 w-2/3 rounded-field bg-night-800" />
          <div className="mt-2 h-4 w-full rounded-pill bg-night-850" />
          <div className="h-4 w-4/5 rounded-pill bg-night-850" />
        </div>
        <div className="h-touch w-full rounded-pill bg-night-800" />
      </div>
    </main>
  );
}

function ClosedScreen({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-5 text-center">
      <MoonStar aria-hidden className="mx-auto size-10 text-ember-400" />
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="leading-relaxed text-ink-muted">
        Essa missão foi encerrada pelo professor. Se a aula ainda vai acontecer,
        vale perguntar se vai sair um link novo.
      </p>
    </main>
  );
}
