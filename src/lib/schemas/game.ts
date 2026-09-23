import { z } from "zod";
import { conclusionSchema, stepDataSchema, type StepData } from "./step";
import {
  conclusionDraftSchema,
  stepDraftSchema,
  type ConclusionDraft,
  type StepDraft,
} from "./step-draft";

/** Texto opcional de formulário: "" vira null antes de chegar ao banco. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length ? value : null));

export const gameInfoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Dê um título ao jogo." })
    .max(120),
  theme: z
    .string()
    .trim()
    .min(1, { error: "Informe o tema da aula." })
    .max(60),
  objective: optionalText(1200),
  mainScripture: optionalText(160),
  description: optionalText(2000),
});

export type GameInfo = z.infer<typeof gameInfoSchema>;

/** O que o editor manda a cada autosave. Ids vêm do cliente e são estáveis. */
export const gameDraftSchema = z.object({
  info: gameInfoSchema,
  steps: z
    .array(z.object({ id: z.uuid(), data: stepDraftSchema }))
    .max(30, { error: "Um jogo com mais de 30 missões vira aula inteira." }),
  conclusion: conclusionDraftSchema,
});

export type GameDraft = z.infer<typeof gameDraftSchema>;

// --- validação de publicação ---------------------------------------------

export type PublishProblem = {
  /** Posição da etapa (base 1), ou null quando o problema é do jogo em si. */
  step: number | null;
  message: string;
};

/**
 * Checa se o rascunho está completo o bastante para virar jogo publicado.
 *
 * O rascunho é permissivo de propósito (o professor salva no meio da frase);
 * é aqui que a régua estrita do `stepDataSchema` volta a valer. Devolve uma
 * lista de pendências em português, não erros do Zod — quem lê é o professor.
 */
export function findPublishProblems(draft: GameDraft): PublishProblem[] {
  const problems: PublishProblem[] = [];

  if (draft.steps.length === 0) {
    problems.push({ step: null, message: "O jogo precisa de ao menos uma missão." });
  }

  if (!draft.conclusion.message.trim()) {
    problems.push({
      step: null,
      message: "Escreva a mensagem da tela de conclusão.",
    });
  }

  draft.steps.forEach((step, index) => {
    const result = stepDataSchema.safeParse(toStrictShape(step.data));
    if (result.success) return;

    for (const message of describeIssues(step.data, result.error.issues)) {
      problems.push({ step: index + 1, message });
    }
  });

  return problems;
}

/**
 * Remove os campos vazios do rascunho para o esquema estrito enxergar
 * "ausente" em vez de "string vazia" — os campos opcionais de lá rejeitam "".
 */
function toStrictShape(draft: StepDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(draft)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) out[key] = trimmed;
      continue;
    }

    if (Array.isArray(value)) {
      out[key] = value.map((entry) =>
        typeof entry === "object" && entry !== null
          ? toStrictShape(entry as StepDraft)
          : entry,
      );
      continue;
    }

    out[key] = value;
  }

  return out;
}

/** Traduz as falhas do Zod em pendências que o professor entende. */
function describeIssues(
  draft: StepDraft,
  issues: { path: PropertyKey[] }[],
): string[] {
  const messages = new Set<string>();

  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");

    switch (field) {
      case "question":
        messages.add("Falta a pergunta.");
        break;
      case "statement":
        messages.add("Falta a afirmação de verdadeiro ou falso.");
        break;
      case "scriptureRef":
        messages.add("Falta a referência bíblica (ex.: Efésios 2:10).");
        break;
      case "scriptureText":
        messages.add("Falta o texto do versículo.");
        break;
      case "context":
        messages.add("Falta descrever a situação.");
        break;
      case "options": {
        const min = draft.type === "reflection" ? 2 : 2;
        messages.add(
          typeof issue.path[1] === "number"
            ? "Há alternativa sem texto."
            : `São necessárias pelo menos ${min} alternativas.`,
        );
        break;
      }
      default:
        messages.add("Há campo obrigatório em branco.");
    }
  }

  return [...messages];
}

// --- conversão para gravação ----------------------------------------------

/**
 * Rascunho → formato do jogador. Só é chamado quando `findPublishProblems`
 * voltou vazio, então o parse estrito aqui não deve falhar; se falhar, é bug e
 * vale estourar em vez de publicar conteúdo quebrado.
 */
export function toPublishedStep(draft: StepDraft): StepData {
  return stepDataSchema.parse(toStrictShape(draft));
}

export function toPublishedConclusion(draft: ConclusionDraft) {
  return conclusionSchema.parse({
    title: draft.title.trim() || "Missão concluída",
    message: draft.message.trim(),
    diagram: draft.diagram.map((d) => d.trim()).filter(Boolean),
    discussionQuestion: draft.discussionQuestion.trim() || undefined,
    scriptureRef: draft.scriptureRef.trim() || undefined,
    scriptureText: draft.scriptureText.trim() || undefined,
  });
}

/** Banco → rascunho, para abrir o editor com o que já existe. */
export function toDraftStep(stored: unknown): StepDraft | null {
  const result = stepDraftSchema.safeParse(stored);
  return result.success ? result.data : null;
}

export function toDraftConclusion(stored: unknown): ConclusionDraft {
  const result = conclusionDraftSchema.safeParse(stored ?? {});
  return result.success
    ? result.data
    : conclusionDraftSchema.parse({ title: "Missão concluída" });
}
