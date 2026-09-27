import { z } from "zod";

/**
 * O que a IA devolve ao ler o PDF da aula.
 *
 * NÃO é o `stepDataSchema`: é um formato irmão, desenhado para o modo estrito
 * de structured outputs da OpenAI, que tem regras próprias —
 *  - todo campo é obrigatório; "opcional" se escreve `nullable`;
 *  - sem `id` nas alternativas (a IA não precisa inventar ids; `to-draft.ts`
 *    gera os estáveis que o progresso do adolescente usa);
 *  - sem limites de tamanho no schema (o modo estrito não aceita todos os
 *    limites do JSON Schema). Os limites vão como orientação nas descrições e
 *    são aplicados de fato na conversão para rascunho.
 *
 * As descrições (`.describe`) chegam ao modelo junto com o schema — são parte
 * do prompt, por isso estão em português e falam com ele.
 */

const nullableText = (description: string) =>
  z.string().nullable().describe(description);

const scriptureRef = nullableText(
  "Referência bíblica exatamente como aparece no PDF (ex.: 'I Pe 1:15-16'). null se não houver.",
);
const scriptureText = nullableText(
  "Texto do versículo COPIADO LITERALMENTE do PDF. null se o PDF só cita a referência sem o texto — nunca complete de memória.",
);

const richOption = z.object({
  label: z
    .string()
    .describe("Texto da alternativa, curto e na voz do adolescente (até ~120 caracteres)."),
  reflection: z
    .string()
    .describe(
      "O que aparece depois que o adolescente escolhe esta alternativa: explica a escolha com respeito, sem dizer 'certo' ou 'errado' (2 a 4 frases).",
    ),
  scriptureRef,
  scriptureText,
});

const common = {
  title: z
    .string()
    .describe("Título curto da missão, como um selo (até ~40 caracteres)."),
  reflection: nullableText(
    "Reflexão geral da missão, mostrada depois da resposta. Pode ser null.",
  ),
  discussionQuestion: nullableText(
    "Pergunta para o professor abrir a conversa presencial depois da missão.",
  ),
  scriptureRef,
  scriptureText,
};

export const aiChoiceStep = z.object({
  type: z.literal("choice"),
  ...common,
  context: nullableText("Situação curta que antecede a pergunta. Pode ser null."),
  question: z.string(),
  options: z
    .array(richOption)
    .describe("De 2 a 4 alternativas, cada uma com a própria reflexão."),
  correctOptionIndex: z
    .number()
    .int()
    .nullable()
    .describe(
      "Índice (a partir de 0) da alternativa esperada, quando houver resposta bíblica clara. null em perguntas de reflexão.",
    ),
});

export const aiScenarioStep = z.object({
  type: z.literal("scenario"),
  ...common,
  context: z
    .string()
    .describe(
      "Cenário do cotidiano do adolescente, contado em 2 a 4 frases (escola, grupo do celular, redes, casa, amigos).",
    ),
  question: z.string(),
  options: z
    .array(richOption)
    .describe("De 2 a 4 alternativas. Nunca há resposta certa em um cenário."),
});

export const aiTrueFalseStep = z.object({
  type: z.literal("true_false"),
  ...common,
  statement: z.string().describe("Afirmação para julgar como verdadeira ou falsa."),
  answer: z.boolean(),
  explanation: z
    .string()
    .describe("O que ensina depois da resposta, apoiado no texto da aula."),
});

export const aiReflectionStep = z.object({
  type: z.literal("reflection"),
  ...common,
  question: z.string().describe("Pergunta pessoal, sem resposta certa."),
  options: z
    .array(z.string())
    .describe("De 4 a 8 opções curtas, tipo etiqueta (1 a 3 palavras cada)."),
  allowMultiple: z.boolean(),
});

export const aiVerseStep = z.object({
  type: z.literal("verse"),
  title: common.title,
  scriptureRef: z.string().describe("Referência exatamente como está no PDF."),
  scriptureText: z
    .string()
    .describe("Texto COPIADO LITERALMENTE do PDF. Só use versículos que o PDF cita por extenso."),
  comment: z
    .string()
    .describe("Comentário curto do professor sobre o versículo, ligado à aula."),
  discussionQuestion: common.discussionQuestion,
});

export const aiOpenQuestionStep = z.object({
  type: z.literal("open_question"),
  ...common,
  context: nullableText("Frase curta antes da pergunta. Pode ser null."),
  question: z.string(),
  placeholder: nullableText("Texto de apoio dentro do campo de resposta."),
});

export const aiStep = z.union([
  aiChoiceStep,
  aiScenarioStep,
  aiTrueFalseStep,
  aiReflectionStep,
  aiVerseStep,
  aiOpenQuestionStep,
]);

export const aiLessonSchema = z.object({
  meta: z.object({
    lessonDate: nullableText(
      "Data da aula no cabeçalho do PDF (ex.: 'EBD 27/09/2026'), no formato AAAA-MM-DD. null se não houver.",
    ),
    lessonNumber: z
      .number()
      .int()
      .nullable()
      .describe("Número da aula no mês (ex.: '4ª Aula' → 4). null se não houver."),
    theme: z
      .string()
      .describe("Tema do mês, como no PDF (ex.: 'Os milagres de Jesus')."),
    title: z
      .string()
      .describe("Título da aula, como no PDF (ex.: 'Senhor, torna-me limpo!')."),
    mainScripture: nullableText("Referência do versículo-chave da aula."),
    objective: z
      .string()
      .describe(
        "Para o professor: o objetivo da aula, as leituras indicadas na 'Obs.' e os louvores sugeridos, se houver.",
      ),
    description: z
      .string()
      .describe(
        "Apresentação curta PARA O ADOLESCENTE na tela de abertura (1 a 2 frases, convidativa, sem entregar a lição).",
      ),
  }),
  steps: z
    .array(aiStep)
    .describe("De 5 a 7 missões, na ordem da jornada."),
  conclusion: z.object({
    title: z.string().describe("Ex.: 'Missão concluída'."),
    message: z
      .string()
      .describe("Mensagem de fechamento que amarra a lição (2 a 4 frases)."),
    diagram: z
      .array(z.string())
      .describe(
        "De 3 a 5 palavras que resumem o caminho da aula, mostradas em cascata (ex.: ['Pecado', 'Jesus', 'Perdão', 'Santificação']).",
      ),
    discussionQuestion: nullableText("Pergunta final para a conversa em sala."),
    scriptureRef,
    scriptureText,
  }),
});

export type AiLesson = z.infer<typeof aiLessonSchema>;
export type AiStep = z.infer<typeof aiStep>;
