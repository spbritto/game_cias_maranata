import {
  date,
  index,
  jsonb,
  integer,
  pgEnum,
  smallint,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { Conclusion, StepData } from "@/lib/schemas/step";
import type { ConclusionDraft, StepDraft } from "@/lib/schemas/step-draft";

/**
 * Tres tabelas no MVP. A coleta de respostas do adolescente (secao 16 do
 * descritivo) ficou fora por decisao de produto e entra depois como tabelas
 * novas — sem alterar nenhuma das que estao aqui.
 * Ver .claude/plans/PLANO_EXECUCAO.md secao 3.
 */

/**
 * Estado do jogo. Enum de banco porque os tres valores sao estaveis; o tipo de
 * etapa, que vai crescer, deliberadamente NAO e enum (ver `step.type`).
 */
export const gameStatusEnum = pgEnum("game_status", [
  "draft",
  "published",
  "closed",
]);

export type GameStatus = (typeof gameStatusEnum.enumValues)[number];

export const teachers = pgTable("teacher", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const games = pgTable(
  "game",
  {
    id: uuid().primaryKey().defaultRandom(),
    /**
     * Quem criou a aula. As aulas são compartilhadas entre todos os
     * professores, então apagar um professor não pode levar as aulas junto
     * (era `cascade` na v1): a aula fica, só perde o autor. Excluir a aula é o
     * único poder que continua restrito a quem a criou.
     */
    teacherId: uuid().references(() => teachers.id, { onDelete: "set null" }),
    /** Último professor que salvou. Só informativo, para o painel. */
    updatedById: uuid().references(() => teachers.id, {
      onDelete: "set null",
    }),

    /** "Missao: Descubra o Proposito" */
    title: text().notNull(),
    /** "Proposito" — vira a base do slug na publicacao. */
    theme: text().notNull(),
    objective: text(),
    /** "Efesios 2:10" */
    mainScripture: text(),
    description: text(),

    /**
     * Domingo em que a aula é dada. `date` em modo string ("2026-09-27"): é um
     * dia do calendário, não um instante — com `Date` o fuso de Brasília
     * empurraria a data para o sábado.
     */
    lessonDate: date({ mode: "string" }),
    /** 1ª a 5ª aula do mês — o domingo do mês. Ver `src/lib/lesson-date.ts`. */
    lessonNumber: smallint(),

    /**
     * Trava otimista do editor. Dois professores podem abrir a mesma aula, e o
     * autosave grava o rascunho inteiro (apagando as etapas que não vieram):
     * sem isto, um editor desatualizado apagaria o que o outro acabou de
     * escrever. Cada gravação de conteúdo exige a versão lida e incrementa.
     */
    version: integer().notNull().default(0),

    status: gameStatusEnum().notNull().default("draft"),

    /**
     * Nulo ate a primeira publicacao. Depois disso NUNCA muda, mesmo que o tema
     * ou o titulo mudem — links ja compartilhados no grupo nao podem quebrar.
     */
    slug: text().unique(),

    /**
     * Tela de fechamento (secao 11). Guarda a forma estrita quando publicado e
     * a de rascunho enquanto o professor edita — as duas passam por Zod, e toda
     * leitura revalida antes de usar.
     */
    conclusion: jsonb().$type<Conclusion | ConclusionDraft>(),

    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("game_teacher_idx").on(table.teacherId)],
);

export const steps = pgTable(
  "step",
  {
    id: uuid().primaryKey().defaultRandom(),
    gameId: uuid()
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    /** Ordem na jornada. Reescrita em bloco, dentro de transacao, ao reordenar. */
    position: integer().notNull(),

    /**
     * `text`, nao enum: a secao 8 do descritivo diz que novos tipos virao, e
     * ALTER TYPE a cada tipo novo e exatamente o atrito que o `jsonb` evita.
     * Os valores validos vivem em STEP_TYPES.
     */
    type: text().notNull(),

    /**
     * Conteudo da etapa. O formato depende de `type` e e garantido pelo
     * `stepDataSchema` — o banco nao valida nada aqui.
     */
    data: jsonb().$type<StepData | StepDraft>().notNull(),

    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("step_game_position_idx").on(table.gameId, table.position)],
);

export const teacherRelations = relations(teachers, ({ many }) => ({
  games: many(games, { relationName: "author" }),
}));

export const gameRelations = relations(games, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [games.teacherId],
    references: [teachers.id],
    relationName: "author",
  }),
  steps: many(steps),
}));

export const stepRelations = relations(steps, ({ one }) => ({
  game: one(games, { fields: [steps.gameId], references: [games.id] }),
}));

export type Teacher = typeof teachers.$inferSelect;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Step = typeof steps.$inferSelect;
export type NewStep = typeof steps.$inferInsert;
