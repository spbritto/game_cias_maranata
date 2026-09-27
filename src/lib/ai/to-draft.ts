import { isIsoDate, sundayOrdinal } from "../lesson-date";
import {
  conclusionDraftSchema,
  newOptionId,
  stepDraftSchema,
  type ConclusionDraft,
  type StepDraft,
} from "../schemas/step-draft";
import type { AiLesson, AiStep } from "./lesson-output-schema";

/**
 * Saída da IA → rascunho do editor.
 *
 * Vira RASCUNHO, não aula publicada: o professor revisa antes. Por isso aqui
 * nada falha por conteúdo — o que a IA fizer comprido demais é cortado no
 * limite do rascunho, e o que ela esquecer aparece na checagem de publicação
 * que já existe (`findPublishProblems`). O que é garantido é a FORMA: tudo
 * passa por `stepDraftSchema` antes de ir ao banco.
 */

export type GeneratedDraft = {
  info: {
    title: string;
    theme: string;
    objective: string | null;
    mainScripture: string | null;
    description: string | null;
    lessonDate: string | null;
    lessonNumber: number | null;
  };
  steps: { id: string; data: StepDraft }[];
  conclusion: ConclusionDraft;
};

/** Limites iguais aos de `step-draft.ts` / `gameInfoSchema`. */
const clip = (value: string | null | undefined, max: number): string =>
  (value ?? "").trim().slice(0, max);

const orNull = (value: string) => (value ? value : null);

const MAX_STEPS = 30;

export function lessonToDraft(
  lesson: AiLesson,
  fallbackDate: string,
): GeneratedDraft {
  const { meta } = lesson;

  // Data do cabeçalho do PDF; sem ela, o próximo domingo, como aula nova.
  const lessonDate =
    meta.lessonDate && isIsoDate(meta.lessonDate) ? meta.lessonDate : fallbackDate;
  // O "Nª Aula" do material vale mais que a conta — é o que a turma conhece.
  const lessonNumber =
    meta.lessonNumber && meta.lessonNumber >= 1 && meta.lessonNumber <= 5
      ? meta.lessonNumber
      : sundayOrdinal(lessonDate);

  return {
    info: {
      title: clip(meta.title, 120) || "Aula gerada",
      theme: clip(meta.theme, 60) || clip(meta.title, 60) || "Aula",
      objective: orNull(clip(meta.objective, 1200)),
      mainScripture: orNull(clip(meta.mainScripture, 160)),
      description: orNull(clip(meta.description, 2000)),
      lessonDate,
      lessonNumber,
    },
    steps: lesson.steps.slice(0, MAX_STEPS).map((step) => ({
      // O mesmo que o editor faz: id estável criado uma vez, nunca trocado.
      id: crypto.randomUUID(),
      data: stepToDraft(step),
    })),
    conclusion: conclusionDraftSchema.parse({
      title: clip(lesson.conclusion.title, 160) || "Missão concluída",
      message: clip(lesson.conclusion.message, 2000),
      diagram: lesson.conclusion.diagram
        .map((entry) => clip(entry, 160))
        .filter(Boolean)
        .slice(0, 6),
      discussionQuestion: clip(lesson.conclusion.discussionQuestion, 600),
      scriptureRef: clip(lesson.conclusion.scriptureRef, 160),
      scriptureText: clip(lesson.conclusion.scriptureText, 2000),
    }),
  };
}

function common(step: {
  title: string;
  reflection?: string | null;
  discussionQuestion: string | null;
  scriptureRef?: string | null;
  scriptureText?: string | null;
}) {
  return {
    title: clip(step.title, 160),
    reflection: clip(step.reflection, 2000),
    discussionQuestion: clip(step.discussionQuestion, 600),
    scriptureRef: clip(step.scriptureRef, 160),
    scriptureText: clip(step.scriptureText, 2000),
  };
}

function richOptions(
  options: {
    label: string;
    reflection: string;
    scriptureRef: string | null;
    scriptureText: string | null;
  }[],
) {
  return options.slice(0, 6).map((option) => ({
    id: newOptionId(),
    label: clip(option.label, 600),
    reflection: clip(option.reflection, 2000),
    scriptureRef: clip(option.scriptureRef, 160),
    scriptureText: clip(option.scriptureText, 2000),
  }));
}

export function stepToDraft(step: AiStep): StepDraft {
  switch (step.type) {
    case "choice": {
      const options = richOptions(step.options);
      const correct =
        step.correctOptionIndex !== null ? options[step.correctOptionIndex] : undefined;
      return stepDraftSchema.parse({
        type: "choice",
        ...common(step),
        context: clip(step.context, 2000),
        question: clip(step.question, 600),
        options,
        correctOptionId: correct?.id ?? "",
      });
    }
    case "scenario":
      return stepDraftSchema.parse({
        type: "scenario",
        ...common(step),
        context: clip(step.context, 2000),
        question: clip(step.question, 600),
        options: richOptions(step.options),
      });
    case "true_false":
      return stepDraftSchema.parse({
        type: "true_false",
        ...common(step),
        statement: clip(step.statement, 600),
        answer: step.answer,
        explanation: clip(step.explanation, 2000),
      });
    case "reflection":
      return stepDraftSchema.parse({
        type: "reflection",
        ...common(step),
        question: clip(step.question, 600),
        options: step.options
          .map((label) => clip(label, 160))
          .filter(Boolean)
          .slice(0, 12)
          .map((label) => ({ id: newOptionId(), label })),
        allowMultiple: step.allowMultiple,
      });
    case "verse":
      return stepDraftSchema.parse({
        type: "verse",
        ...common(step),
        comment: clip(step.comment, 2000),
      });
    case "open_question":
      return stepDraftSchema.parse({
        type: "open_question",
        ...common(step),
        context: clip(step.context, 2000),
        question: clip(step.question, 600),
        placeholder: clip(step.placeholder, 160),
        maxLength: 600,
      });
  }
}
