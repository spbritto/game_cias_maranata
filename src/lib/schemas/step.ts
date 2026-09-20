import { z } from "zod";

/**
 * Fonte da verdade dos tipos de etapa (secao 8 do descritivo).
 *
 * Este arquivo e o contrato unico do sistema: valida o que entra no `jsonb` da
 * coluna `step.data`, gera os tipos TypeScript do runtime do jogo e alimenta os
 * formularios do editor. O banco NAO garante a forma desse conteudo — toda
 * escrita precisa passar por aqui. Ver .claude/plans/PLANO_EXECUCAO.md secao 3.1.
 */

export const STEP_TYPES = [
  "choice",
  "scenario",
  "true_false",
  "reflection",
  "verse",
  "open_question",
] as const;

export type StepType = (typeof STEP_TYPES)[number];

/** Rotulos em pt-BR usados no editor. */
export const STEP_TYPE_LABELS: Record<StepType, string> = {
  choice: "Escolha",
  scenario: "Situação do cotidiano",
  true_false: "Verdadeiro ou falso",
  reflection: "Reflexão pessoal",
  verse: "Versículo",
  open_question: "Pergunta aberta",
};

export const STEP_TYPE_HINTS: Record<StepType, string> = {
  choice: "Situação com alternativas. Cada alternativa revela sua própria reflexão.",
  scenario: "Cenário próximo da realidade do adolescente, para gerar conversa.",
  true_false: "Pergunta rápida para quebrar o ritmo e verificar entendimento.",
  reflection: "Pergunta pessoal sem resposta certa.",
  verse: "Texto bíblico com um comentário seu.",
  open_question: "O adolescente escreve a própria resposta.",
};

// --- blocos reutilizaveis -------------------------------------------------

const shortText = z.string().trim().min(1).max(160);
const mediumText = z.string().trim().min(1).max(600);
const longText = z.string().trim().min(1).max(2000);

/** Referencia biblica: "Efesios 2:10" + o texto em si. Sempre opcional. */
const scriptureFields = {
  scriptureRef: shortText.optional(),
  scriptureText: longText.optional(),
};

/**
 * Campos comuns da secao 9 do descritivo. Quase tudo opcional de proposito:
 * "Nem todos os campos precisam ser obrigatorios".
 */
const commonFields = {
  title: shortText.optional(),
  /** Contexto / situacao que antecede a pergunta. */
  context: longText.optional(),
  /** Reflexao mostrada depois que o adolescente responde. */
  reflection: longText.optional(),
  /** Pergunta que o professor usa para abrir a conversa presencial. */
  discussionQuestion: mediumText.optional(),
  ...scriptureFields,
};

/**
 * `id` estavel por alternativa. E o que permitira o GROUP BY quando a coleta de
 * respostas entrar (secao 16 do descritivo) sem precisar normalizar a tabela.
 */
const optionId = z.string().trim().min(1).max(64);

/**
 * Alternativa que ensina: a reflexao vive NA alternativa, nao na etapa.
 * E o que sustenta a secao 10 — o feedback explica a escolha feita, em vez de
 * dizer "certo" ou "errado".
 */
export const richOptionSchema = z.object({
  id: optionId,
  label: mediumText,
  reflection: longText.optional(),
  ...scriptureFields,
});

/** Alternativa simples, do tipo etiqueta: "Deus", "Amigos", "Redes sociais". */
export const plainOptionSchema = z.object({
  id: optionId,
  label: shortText,
});

export type RichOption = z.infer<typeof richOptionSchema>;
export type PlainOption = z.infer<typeof plainOptionSchema>;

// --- tipos de etapa -------------------------------------------------------

/** 8.1 — Escolha. Pode ter resposta esperada, mas nao precisa. */
export const choiceStepSchema = z.object({
  type: z.literal("choice"),
  ...commonFields,
  question: mediumText,
  options: z.array(richOptionSchema).min(2).max(6),
  /**
   * Quando ausente, a interface nao marca nenhuma alternativa como certa —
   * o padrao para situacoes de reflexao (secao 3.4 do descritivo).
   */
  correctOptionId: optionId.optional(),
});

/** 8.2 — Situacao do cotidiano. Contexto obrigatorio; nunca ha resposta certa. */
export const scenarioStepSchema = z.object({
  type: z.literal("scenario"),
  ...commonFields,
  context: longText,
  question: mediumText,
  options: z.array(richOptionSchema).min(2).max(6),
});

/** 8.3 — Verdadeiro ou falso. Aqui existe resposta certa, e ela ensina depois. */
export const trueFalseStepSchema = z.object({
  type: z.literal("true_false"),
  ...commonFields,
  statement: mediumText,
  answer: z.boolean(),
  explanation: longText.optional(),
});

/** 8.4 — Reflexao pessoal. Sem certo nem errado; pode aceitar varias escolhas. */
export const reflectionStepSchema = z.object({
  type: z.literal("reflection"),
  ...commonFields,
  question: mediumText,
  options: z.array(plainOptionSchema).min(2).max(12),
  allowMultiple: z.boolean().default(false),
});

/** 8.5 — Versiculo. Tela de leitura: nao ha o que responder. */
export const verseStepSchema = z.object({
  type: z.literal("verse"),
  ...commonFields,
  scriptureRef: shortText,
  scriptureText: longText,
  /** Comentario do professor sobre o texto. */
  comment: longText.optional(),
});

/** 8.6 — Pergunta aberta. A resposta fica so no aparelho do adolescente. */
export const openQuestionStepSchema = z.object({
  type: z.literal("open_question"),
  ...commonFields,
  question: mediumText,
  placeholder: shortText.optional(),
  maxLength: z.number().int().min(50).max(1000).default(400),
});

export const stepDataSchema = z.discriminatedUnion("type", [
  choiceStepSchema,
  scenarioStepSchema,
  trueFalseStepSchema,
  reflectionStepSchema,
  verseStepSchema,
  openQuestionStepSchema,
]);

export type StepData = z.infer<typeof stepDataSchema>;
export type ChoiceStepData = z.infer<typeof choiceStepSchema>;
export type ScenarioStepData = z.infer<typeof scenarioStepSchema>;
export type TrueFalseStepData = z.infer<typeof trueFalseStepSchema>;
export type ReflectionStepData = z.infer<typeof reflectionStepSchema>;
export type VerseStepData = z.infer<typeof verseStepSchema>;
export type OpenQuestionStepData = z.infer<typeof openQuestionStepSchema>;

// --- tela de conclusao ----------------------------------------------------

/** Secao 11 do descritivo. O `diagram` e a representacao visual em cascata. */
export const conclusionSchema = z.object({
  title: shortText.default("Missão concluída"),
  message: longText,
  /** Ex.: ["CRIADOR", "IDENTIDADE", "PROPOSITO", "VIDA"] */
  diagram: z.array(shortText).max(6).optional(),
  discussionQuestion: mediumText.optional(),
  ...scriptureFields,
});

export type Conclusion = z.infer<typeof conclusionSchema>;

// --- helpers --------------------------------------------------------------

/**
 * Diz se a etapa espera alguma acao do adolescente. Etapas de leitura pura
 * (versiculo) avancam so com "continuar" — o runtime usa isso para decidir se
 * mostra alternativas ou so o botao de avancar.
 */
export function stepExpectsAnswer(data: StepData): boolean {
  return data.type !== "verse";
}

/** Texto principal da etapa, usado em previews e no cabecalho do editor. */
export function stepHeadline(data: StepData): string {
  switch (data.type) {
    case "true_false":
      return data.statement;
    case "verse":
      return data.scriptureRef;
    default:
      return data.question;
  }
}
