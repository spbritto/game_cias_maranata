import OpenAI from "openai";
// Os erros de "resposta cortada" não saem na raiz do pacote, só neste subpath.
import {
  ContentFilterFinishReasonError,
  LengthFinishReasonError,
} from "openai/error";
import { zodTextFormat } from "openai/helpers/zod";
import { aiLessonSchema, type AiLesson } from "./lesson-output-schema";
import { LESSON_SYSTEM_PROMPT, LESSON_USER_PROMPT } from "./lesson-prompt";

/**
 * Lê o PDF da aula escrita e devolve a aula montada pela IA.
 *
 * O PDF vai direto para a OpenAI como arquivo (ela lê texto e página), sem
 * biblioteca de extração aqui, e não é guardado em lugar nenhum — a Vercel não
 * tem disco persistente e o que importa fica nas missões.
 *
 * Sem `import "server-only"` de propósito, pelo mesmo motivo de `db/client.ts`:
 * `scripts/testar-geracao.ts` roda isto fora do Next. A chave não vaza para o
 * navegador de qualquer forma — `OPENAI_API_KEY` não tem prefixo
 * `NEXT_PUBLIC_`, e este módulo só é importado por Server Actions.
 */

export const DEFAULT_MODEL = "gpt-5-mini";
/** Uma aula leva de 20 a 60s; acima disso algo travou. */
const TIMEOUT_MS = 110_000;

export type GenerateResult =
  | { ok: true; lesson: AiLesson; model: string }
  | { ok: false; error: string };

export async function generateLesson(
  pdf: Uint8Array,
  filename: string,
): Promise<GenerateResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "A geração por IA ainda não foi configurada (falta OPENAI_API_KEY no servidor).",
    };
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  // Sem retentativas automáticas: com a espera de uma geração inteira, um
  // retry silencioso dobraria o tempo na frente do professor.
  const client = new OpenAI({ apiKey, timeout: TIMEOUT_MS, maxRetries: 0 });

  try {
    const response = await client.responses.parse({
      model,
      // Modelos de raciocínio (gpt-5*, o*) aceitam o ajuste; os outros
      // recusariam o parâmetro. "low" basta para reorganizar um texto pronto
      // e corta bastante o tempo de espera.
      ...(isReasoningModel(model) ? { reasoning: { effort: "low" as const } } : {}),
      instructions: LESSON_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: filename || "aula.pdf",
              file_data: `data:application/pdf;base64,${Buffer.from(pdf).toString("base64")}`,
            },
            { type: "input_text", text: LESSON_USER_PROMPT },
          ],
        },
      ],
      text: { format: zodTextFormat(aiLessonSchema, "aula") },
      // Nada de histórico guardado na OpenAI: o material é da igreja.
      store: false,
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      return {
        ok: false,
        error:
          "A IA não conseguiu montar a aula com esse PDF. Confira se é a aula escrita (com texto, não uma foto) e tente de novo.",
      };
    }

    // O SDK já valida contra o schema; revalidar é o contrato do projeto —
    // nada entra no banco sem passar por Zod aqui dentro.
    const lesson = aiLessonSchema.safeParse(parsed);
    if (!lesson.success) {
      return {
        ok: false,
        error: "A IA devolveu a aula num formato inesperado. Tente de novo.",
      };
    }

    return { ok: true, lesson: lesson.data, model };
  } catch (error) {
    console.error("Falha ao gerar aula com a OpenAI:", error);
    return { ok: false, error: describeError(error) };
  }
}

function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/.test(model);
}

/** Traduz a falha para o professor — quem lê não é quem programou. */
function describeError(error: unknown): string {
  if (error instanceof OpenAI.AuthenticationError) {
    return "A chave da OpenAI configurada no servidor foi recusada. Confira OPENAI_API_KEY.";
  }
  if (error instanceof OpenAI.RateLimitError) {
    const code = (error as { code?: string | null }).code;
    return code === "insufficient_quota"
      ? "A conta da OpenAI está sem saldo. Adicione créditos e tente de novo."
      : "A OpenAI pediu uma pausa (muitas gerações seguidas). Tente de novo em um minuto.";
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return "A geração demorou demais e foi interrompida. Tente de novo — costuma sair na segunda.";
  }
  if (error instanceof OpenAI.APIConnectionError) {
    return "Não consegui falar com a OpenAI agora. Tente de novo em instantes.";
  }
  if (error instanceof LengthFinishReasonError) {
    return "A aula gerada ficou longa demais e foi cortada. Tente de novo.";
  }
  if (error instanceof ContentFilterFinishReasonError) {
    return "A OpenAI recusou gerar a partir desse conteúdo.";
  }
  if (error instanceof OpenAI.NotFoundError) {
    return "O modelo configurado em OPENAI_MODEL não existe ou não está liberado para essa chave.";
  }
  if (error instanceof OpenAI.BadRequestError) {
    return "A OpenAI não aceitou esse arquivo. Confira se é um PDF de texto e tente de novo.";
  }
  return "Algo deu errado ao gerar a aula. Tente de novo em instantes.";
}
