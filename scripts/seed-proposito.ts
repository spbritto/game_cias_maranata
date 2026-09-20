/**
 * Semeia o jogo "Propósito" — o cenário de validação ponta a ponta definido na
 * seção 19 do descritivo e na Fase 0 do plano.
 *
 * Roda com: npm run db:seed
 *
 * É idempotente: reexecutar apaga e recria o jogo, mantendo o mesmo slug, para
 * que o link aberto no celular durante o desenvolvimento não mude. O conteúdo
 * em si vive em src/lib/fixtures/proposito.ts, compartilhado com a rota /demo.
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { games, steps, teachers } from "../src/db/schema";
import { conclusionSchema, stepDataSchema } from "../src/lib/schemas/step";
import {
  PROPOSITO_SLUG,
  propositoConclusion,
  propositoGame,
  propositoSteps,
} from "../src/lib/fixtures/proposito";
import { gameUrl } from "../src/lib/slug";

const SEED_EMAIL = "professor@seed.local";

async function main() {
  console.log("Validando o conteúdo contra os schemas...");
  // Dogfooding do contrato da seção 3.1 do plano: nada entra no jsonb sem passar
  // pelo Zod, nem mesmo o seed.
  const conclusion = conclusionSchema.parse(propositoConclusion);
  const validated = propositoSteps.map((data, i) => {
    const result = stepDataSchema.safeParse(data);
    if (!result.success) {
      console.error(`Etapa ${i + 1} (${data.type}) inválida:`);
      console.error(JSON.stringify(result.error.issues, null, 2));
      process.exit(1);
    }
    return result.data;
  });
  console.log(`  ${validated.length} etapas válidas.`);

  // Professor do seed. O hash é propositalmente inválido: nenhuma senha casa
  // com ele, então esse registro não serve para login. A Fase 3 traz o
  // scripts/criar-professor.ts para cadastrar professores de verdade.
  let [teacher] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.email, SEED_EMAIL));

  if (!teacher) {
    [teacher] = await db
      .insert(teachers)
      .values({
        name: "Professor (seed)",
        email: SEED_EMAIL,
        passwordHash: "!sem-login",
      })
      .returning();
    console.log("Professor do seed criado.");
  }

  // Recria do zero para o seed ser idempotente. O cascade leva as etapas junto.
  const [existing] = await db
    .select({ id: games.id })
    .from(games)
    .where(eq(games.slug, PROPOSITO_SLUG));

  if (existing) {
    await db.delete(games).where(eq(games.id, existing.id));
    console.log("Jogo anterior removido.");
  }

  const [game] = await db
    .insert(games)
    .values({
      ...propositoGame,
      teacherId: teacher.id,
      status: "published",
      slug: PROPOSITO_SLUG,
      conclusion,
      publishedAt: new Date(),
    })
    .returning();

  await db.insert(steps).values(
    validated.map((data, index) => ({
      gameId: game.id,
      position: index,
      type: data.type,
      data,
    })),
  );

  console.log(`\nJogo "${game.title}" semeado com ${validated.length} etapas.`);
  console.log(`Link: ${gameUrl(PROPOSITO_SLUG)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Falha no seed:", error);
    process.exit(1);
  });
