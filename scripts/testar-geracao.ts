/**
 * Gera uma aula a partir de um PDF, sem banco e sem interface — para afinar o
 * prompt da IA olhando o resultado direto.
 *
 * Roda com: npm run testar-geracao -- "caminho/da/aula.pdf"
 * (sem caminho, usa o primeiro .pdf da raiz do projeto)
 *
 * Imprime um resumo das missões (com as referências bíblicas usadas, para
 * conferir contra o PDF) e o que ainda impediria a publicação. A saída
 * completa fica em `geracao-teste.json` (ignorado pelo git). Custa uma
 * chamada à OpenAI na chave de `.env.local`.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { generateLesson } from "../src/lib/ai/generate-lesson";
import { lessonToDraft } from "../src/lib/ai/to-draft";
import { findPublishProblems } from "../src/lib/schemas/game";
import { STEP_TYPE_LABELS } from "../src/lib/schemas/step";
import type { StepDraft } from "../src/lib/schemas/step-draft";

function headline(data: StepDraft): string {
  if (data.type === "true_false") return data.statement;
  if (data.type === "verse") return data.scriptureText;
  return data.question;
}

async function main() {
  const path =
    process.argv[2] ?? readdirSync(".").find((f) => f.toLowerCase().endsWith(".pdf"));
  if (!path) {
    console.error("Passe o caminho do PDF: npm run testar-geracao -- aula.pdf");
    process.exit(1);
  }

  console.log(`Gerando a partir de "${basename(path)}"...`);
  const started = Date.now();
  const result = await generateLesson(new Uint8Array(readFileSync(path)), basename(path));
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (!result.ok) {
    console.error(`Falhou em ${seconds}s: ${result.error}`);
    process.exit(1);
  }

  console.log(`Pronto em ${seconds}s com ${result.model}.\n`);
  writeFileSync("geracao-teste.json", JSON.stringify(result.lesson, null, 2));

  const draft = lessonToDraft(result.lesson, "2099-01-04");
  const { info } = draft;
  console.log(`Tema:   ${info.theme}`);
  console.log(`Título: ${info.title}`);
  console.log(`Aula:   ${info.lessonNumber}ª · ${info.lessonDate}`);
  console.log(`Abertura: ${info.description}\n`);

  draft.steps.forEach((step, i) => {
    const data = step.data;
    console.log(`${i + 1}. [${STEP_TYPE_LABELS[data.type]}] ${data.title}`);
    console.log(`   ${headline(data)}`);
    if ("options" in data) {
      for (const option of data.options) {
        const mark =
          data.type === "choice" && data.correctOptionId === option.id ? "*" : "-";
        console.log(`     ${mark} ${option.label}`);
      }
    }
    if (data.scriptureRef) console.log(`   📖 ${data.scriptureRef}`);
  });

  console.log(`\nConclusão: ${draft.conclusion.message}`);
  console.log(`Caminho: ${draft.conclusion.diagram.join(" → ")}`);

  const problems = findPublishProblems(draft);
  console.log(
    problems.length
      ? `\nPendências para publicar:\n${problems.map((p) => `  - ${p.step ? `Missão ${p.step}: ` : ""}${p.message}`).join("\n")}`
      : "\nNenhuma pendência: já daria para publicar.",
  );
  console.log("\nSaída completa em geracao-teste.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
