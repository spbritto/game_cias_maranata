import { z } from "zod";
import { STEP_TYPES, type StepType } from "./step";

/**
 * Esquemas de RASCUNHO das etapas.
 *
 * O editor salva sozinho enquanto o professor digita, então precisa aceitar
 * etapa pela metade — uma pergunta em branco, uma alternativa só. O contrato do
 * projeto continua valendo: nada entra no `jsonb` sem passar por Zod. Muda só a
 * severidade.
 *
 *   rascunho (aqui)      → tudo opcional, só a FORMA é garantida
 *   `stepDataSchema`     → estrito, exigido para publicar e para o jogador
 *
 * Todo rascunho válido pelo esquema estrito também é válido aqui, então
 * publicar nunca precisa converter nada: só revalidar.
 */

const text = (max: number) => z.string().max(max).default("");

const draftCommon = {
  title: text(160),
  context: text(2000),
  reflection: text(2000),
  discussionQuestion: text(600),
  scriptureRef: text(160),
  scriptureText: text(2000),
};

export const richOptionDraftSchema = z.object({
  id: z.string().min(1).max(64),
  label: text(600),
  reflection: text(2000),
  scriptureRef: text(160),
  scriptureText: text(2000),
});

export const plainOptionDraftSchema = z.object({
  id: z.string().min(1).max(64),
  label: text(160),
});

export const stepDraftSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("choice"),
    ...draftCommon,
    question: text(600),
    options: z.array(richOptionDraftSchema).max(6).default([]),
    correctOptionId: z.string().max(64).default(""),
  }),
  z.object({
    type: z.literal("scenario"),
    ...draftCommon,
    question: text(600),
    options: z.array(richOptionDraftSchema).max(6).default([]),
  }),
  z.object({
    type: z.literal("true_false"),
    ...draftCommon,
    statement: text(600),
    answer: z.boolean().default(true),
    explanation: text(2000),
  }),
  z.object({
    type: z.literal("reflection"),
    ...draftCommon,
    question: text(600),
    options: z.array(plainOptionDraftSchema).max(12).default([]),
    allowMultiple: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("verse"),
    ...draftCommon,
    comment: text(2000),
  }),
  z.object({
    type: z.literal("open_question"),
    ...draftCommon,
    question: text(600),
    placeholder: text(160),
    maxLength: z.number().int().min(50).max(1000).default(400),
  }),
]);

export type StepDraft = z.infer<typeof stepDraftSchema>;

export const conclusionDraftSchema = z.object({
  title: text(160),
  message: text(2000),
  diagram: z.array(text(160)).max(6).default([]),
  discussionQuestion: text(600),
  scriptureRef: text(160),
  scriptureText: text(2000),
});

export type ConclusionDraft = z.infer<typeof conclusionDraftSchema>;

// --- fábricas -------------------------------------------------------------

/** Id curto e estável para alternativas novas. */
export function newOptionId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const emptyCommon = {
  title: "",
  context: "",
  reflection: "",
  discussionQuestion: "",
  scriptureRef: "",
  scriptureText: "",
};

/** Etapa em branco do tipo pedido, já com o mínimo para o professor preencher. */
export function blankStep(type: StepType): StepDraft {
  switch (type) {
    case "choice":
      return {
        ...emptyCommon,
        type,
        question: "",
        correctOptionId: "",
        options: [blankRichOption(), blankRichOption()],
      };
    case "scenario":
      return {
        ...emptyCommon,
        type,
        question: "",
        options: [blankRichOption(), blankRichOption()],
      };
    case "true_false":
      return { ...emptyCommon, type, statement: "", answer: true, explanation: "" };
    case "reflection":
      return {
        ...emptyCommon,
        type,
        question: "",
        allowMultiple: false,
        options: [blankPlainOption(), blankPlainOption()],
      };
    case "verse":
      return { ...emptyCommon, type, comment: "" };
    case "open_question":
      return {
        ...emptyCommon,
        type,
        question: "",
        placeholder: "",
        maxLength: 400,
      };
  }
}

export function blankRichOption() {
  return {
    id: newOptionId(),
    label: "",
    reflection: "",
    scriptureRef: "",
    scriptureText: "",
  };
}

export function blankPlainOption() {
  return { id: newOptionId(), label: "" };
}

export function blankConclusion(): ConclusionDraft {
  return {
    title: "Missão concluída",
    message: "",
    diagram: [],
    discussionQuestion: "",
    scriptureRef: "",
    scriptureText: "",
  };
}

/** Diz se o tipo aceita alternativas — usado pelo editor para montar os campos. */
export function hasOptions(
  draft: StepDraft,
): draft is Extract<StepDraft, { options: unknown[] }> {
  return "options" in draft;
}

export const STEP_TYPE_VALUES = STEP_TYPES;
