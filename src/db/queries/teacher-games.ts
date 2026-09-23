import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { games, steps, type GameStatus } from "@/db/schema";
import { toDraftConclusion, toDraftStep } from "@/lib/schemas/game";
import type { ConclusionDraft, StepDraft } from "@/lib/schemas/step-draft";

/** Tag do conjunto de jogos de um professor (lista do painel). */
export const teacherGamesTag = (teacherId: string) => `teacher-games:${teacherId}`;
/** Tag de um jogo específico no editor. */
export const gameDraftTag = (gameId: string) => `game-draft:${gameId}`;

export type GameSummary = {
  id: string;
  title: string;
  theme: string;
  status: GameStatus;
  slug: string | null;
  stepCount: number;
  updatedAt: Date;
  publishedAt: Date | null;
};

/**
 * Lista do painel. Cacheada por professor e invalidada por `updateTag` a cada
 * mutação — o painel é a tela que ele abre mais vezes.
 *
 * Não exportar uma variante sem `teacherId`: é o argumento que garante que
 * ninguém veja jogo de outro professor.
 */
export async function listGamesForTeacher(
  teacherId: string,
): Promise<GameSummary[]> {
  "use cache";
  cacheTag(teacherGamesTag(teacherId));
  cacheLife("minutes");

  return db
    .select({
      id: games.id,
      title: games.title,
      theme: games.theme,
      status: games.status,
      slug: games.slug,
      updatedAt: games.updatedAt,
      publishedAt: games.publishedAt,
      stepCount: count(steps.id),
    })
    .from(games)
    .leftJoin(steps, eq(steps.gameId, games.id))
    .where(eq(games.teacherId, teacherId))
    .groupBy(games.id)
    .orderBy(desc(games.updatedAt));
}

export type GameDraftRecord = {
  id: string;
  status: GameStatus;
  slug: string | null;
  info: {
    title: string;
    theme: string;
    objective: string;
    mainScripture: string;
    description: string;
  };
  steps: { id: string; data: StepDraft }[];
  conclusion: ConclusionDraft;
};

/**
 * Carrega um jogo para edição. Devolve null se não existir OU se não for do
 * professor — a diferença entre "não existe" e "não é seu" não deve vazar.
 */
export async function getGameDraft(
  gameId: string,
  teacherId: string,
): Promise<GameDraftRecord | null> {
  const [game] = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.teacherId, teacherId)));

  if (!game) return null;

  const rows = await db
    .select({ id: steps.id, data: steps.data })
    .from(steps)
    .where(eq(steps.gameId, gameId))
    .orderBy(asc(steps.position));

  return {
    id: game.id,
    status: game.status,
    slug: game.slug,
    info: {
      title: game.title,
      theme: game.theme,
      objective: game.objective ?? "",
      mainScripture: game.mainScripture ?? "",
      description: game.description ?? "",
    },
    // Etapa que não casa nem com o esquema permissivo está corrompida de
    // verdade: some do editor em vez de impedir a abertura do jogo inteiro.
    steps: rows.flatMap((row) => {
      const data = toDraftStep(row.data);
      return data ? [{ id: row.id, data }] : [];
    }),
    conclusion: toDraftConclusion(game.conclusion),
  };
}

/** Só a dona da linha, para as ações verificarem posse antes de escrever. */
export async function findOwnedGame(gameId: string, teacherId: string) {
  const [game] = await db
    .select({
      id: games.id,
      status: games.status,
      slug: games.slug,
      theme: games.theme,
      title: games.title,
    })
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.teacherId, teacherId)));
  return game ?? null;
}
