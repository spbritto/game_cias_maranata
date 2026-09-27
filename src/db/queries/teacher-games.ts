import "server-only";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { games, steps, teachers, type GameStatus } from "@/db/schema";
import { toDraftConclusion, toDraftStep } from "@/lib/schemas/game";
import type { ConclusionDraft, StepDraft } from "@/lib/schemas/step-draft";

/**
 * Consultas da área do professor.
 *
 * As aulas são COMPARTILHADAS: qualquer professor logado vê, edita, publica,
 * duplica e encerra qualquer aula — decisão de produto da rodada 2 (a gestão é
 * coletiva, ver .claude/plans/PLANO_EXECUCAO.md seção 8). Por isso nada aqui
 * filtra por professor. A única exceção é excluir, que continua com o autor e
 * é checada na action com o `teacherId` devolvido por `findGame`.
 */

/** Tag da lista do painel — uma só, já que todos veem a mesma lista. */
export const allGamesTag = "games:all";
/** Tag de um jogo específico no editor. */
export const gameDraftTag = (gameId: string) => `game-draft:${gameId}`;

export type GameSummary = {
  id: string;
  title: string;
  theme: string;
  status: GameStatus;
  slug: string | null;
  stepCount: number;
  lessonDate: string | null;
  lessonNumber: number | null;
  authorId: string | null;
  authorName: string | null;
  updatedByName: string | null;
  updatedAt: Date;
  publishedAt: Date | null;
};

const author = alias(teachers, "author");
const editor = alias(teachers, "editor");

/**
 * Lista do painel, de todos os professores. Cacheada e invalidada por
 * `updateTag(allGamesTag)` a cada mutação.
 *
 * Ordem: aulas com data primeiro, do domingo mais recente para o mais antigo
 * (o painel agrupa por mês); sem data por último, pela última edição.
 */
export async function listAllGames(): Promise<GameSummary[]> {
  "use cache";
  cacheTag(allGamesTag);
  cacheLife("minutes");

  return db
    .select({
      id: games.id,
      title: games.title,
      theme: games.theme,
      status: games.status,
      slug: games.slug,
      lessonDate: games.lessonDate,
      lessonNumber: games.lessonNumber,
      authorId: games.teacherId,
      authorName: author.name,
      updatedByName: editor.name,
      updatedAt: games.updatedAt,
      publishedAt: games.publishedAt,
      stepCount: count(steps.id),
    })
    .from(games)
    .leftJoin(steps, eq(steps.gameId, games.id))
    .leftJoin(author, eq(author.id, games.teacherId))
    .leftJoin(editor, eq(editor.id, games.updatedById))
    .groupBy(games.id, author.name, editor.name)
    .orderBy(sql`${games.lessonDate} desc nulls last`, desc(games.updatedAt));
}

export type GameDraftRecord = {
  id: string;
  status: GameStatus;
  slug: string | null;
  /** Versão lida — o editor devolve a cada save (trava otimista). */
  version: number;
  authorId: string | null;
  info: {
    title: string;
    theme: string;
    objective: string;
    mainScripture: string;
    description: string;
    /** "" quando sem data, para caber direto no `<input type="date">`. */
    lessonDate: string;
    lessonNumber: number | null;
  };
  steps: { id: string; data: StepDraft }[];
  conclusion: ConclusionDraft;
};

/** Carrega um jogo para edição ou prévia. Null se não existir. */
export async function getGameDraft(
  gameId: string,
): Promise<GameDraftRecord | null> {
  const [game] = await db.select().from(games).where(eq(games.id, gameId));

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
    version: game.version,
    authorId: game.teacherId,
    info: {
      title: game.title,
      theme: game.theme,
      objective: game.objective ?? "",
      mainScripture: game.mainScripture ?? "",
      description: game.description ?? "",
      lessonDate: game.lessonDate ?? "",
      lessonNumber: game.lessonNumber,
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

/** O mínimo que as actions precisam antes de escrever. */
export async function findGame(gameId: string) {
  const [game] = await db
    .select({
      id: games.id,
      teacherId: games.teacherId,
      status: games.status,
      slug: games.slug,
      theme: games.theme,
      title: games.title,
    })
    .from(games)
    .where(eq(games.id, gameId));
  return game ?? null;
}

/**
 * Quem pode excluir: o autor, ou qualquer um se o autor já não existe (a aula
 * ficaria sem ninguém capaz de apagá-la).
 */
export function canDeleteGame(
  game: { teacherId: string | null },
  teacherId: string,
): boolean {
  return game.teacherId === null || game.teacherId === teacherId;
}
