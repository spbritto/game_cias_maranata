import { notFound } from "next/navigation";
import { GameRuntime } from "@/components/jogador/game-runtime";
import {
  PROPOSITO_SLUG,
  propositoConclusion,
  propositoGame,
  propositoSteps,
} from "@/lib/fixtures/proposito";
import type { PlayableGame } from "@/lib/game";

/**
 * Andaime de desenvolvimento: joga o "Propósito" a partir do fixture, sem Neon.
 *
 * Existe para iterar no visual da jornada sem depender do banco e para revisar a
 * experiência inteira em uma URL só. Sai do ar em produção. Quando a prévia do
 * professor (Fase 4) existir, esta rota pode ser removida.
 */
export const metadata = { title: "Demonstração" };

const demoGame: PlayableGame = {
  ...propositoGame,
  slug: `demo-${PROPOSITO_SLUG}`,
  conclusion: propositoConclusion,
  steps: propositoSteps.map((data, i) => ({ id: `demo-${i}`, data })),
};

export default function DemoPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <GameRuntime game={demoGame} />;
}
