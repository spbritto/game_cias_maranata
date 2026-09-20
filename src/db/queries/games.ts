import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { games, steps, type GameStatus } from "@/db/schema";
import type { PlayableGame } from "@/lib/game";
import { conclusionSchema, stepDataSchema } from "@/lib/schemas/step";

export type GameForPlay = {
  status: GameStatus;
  game: PlayableGame;
};

/** Tag de cache do jogo. A publicação chama `updateTag` com ela. */
export const gameTag = (slug: string) => `game:${slug}`;

/**
 * Carrega um jogo publicado pelo slug, para a rota pública.
 *
 * Cacheado por tag: o Neon hiberna no free tier e a primeira consulta leva ~1s.
 * Como o conteúdo de um jogo publicado quase não muda, a turma inteira é servida
 * do cache e ninguém paga esse cold start. A publicação invalida com
 * `updateTag(gameTag(slug))`.
 */
export async function getGameBySlug(slug: string): Promise<GameForPlay | null> {
  "use cache";
  cacheTag(gameTag(slug));
  cacheLife("days");

  const [row] = await db
    .select({
      id: games.id,
      title: games.title,
      theme: games.theme,
      description: games.description,
      mainScripture: games.mainScripture,
      status: games.status,
      conclusion: games.conclusion,
    })
    .from(games)
    .where(eq(games.slug, slug));

  // Rascunho não é acessível por link: para quem tem a URL, não existe.
  if (!row || row.status === "draft") return null;

  const stepRows = await db
    .select({ id: steps.id, data: steps.data })
    .from(steps)
    .where(eq(steps.gameId, row.id))
    .orderBy(asc(steps.position));

  /*
    Validação na leitura, não só na escrita. O `$type<StepData>()` do Drizzle é
    uma afirmação de tipo, não uma garantia — o Postgres aceita qualquer JSON na
    coluna. Este é o custo do jsonb que o plano registrou (seção 3.1), então uma
    etapa corrompida é descartada em vez de derrubar a jornada inteira.
  */
  const playableSteps = stepRows.flatMap((step) => {
    const parsed = stepDataSchema.safeParse(step.data);
    if (!parsed.success) {
      console.error(
        `Etapa ${step.id} do jogo ${slug} tem conteúdo inválido e foi omitida.`,
        parsed.error.issues,
      );
      return [];
    }
    return [{ id: step.id, data: parsed.data }];
  });

  const conclusion = conclusionSchema.safeParse(row.conclusion);

  return {
    status: row.status,
    game: {
      slug,
      title: row.title,
      theme: row.theme,
      description: row.description,
      mainScripture: row.mainScripture,
      steps: playableSteps,
      conclusion: conclusion.success ? conclusion.data : null,
    },
  };
}
