import type { Conclusion, StepData } from "@/lib/schemas/step";

/**
 * Formato que o runtime do jogo consome.
 *
 * É de propósito mais pobre que as linhas do banco: o runtime não conhece
 * Drizzle, `teacherId`, timestamps nem status. Isso é o que permite renderizar
 * a jornada a partir do Neon, de um rascunho em edição (prévia da Fase 4) ou de
 * um fixture, sem o componente saber a diferença.
 */

export type PlayableStep = {
  /** Id real da etapa no banco — vira a chave das respostas no localStorage. */
  id: string;
  data: StepData;
};

export type PlayableGame = {
  slug: string;
  title: string;
  theme: string;
  description: string | null;
  mainScripture: string | null;
  steps: PlayableStep[];
  conclusion: Conclusion | null;
};
