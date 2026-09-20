import { ImageResponse } from "next/og";
import { getGameBySlug } from "@/db/queries/games";

/**
 * Imagem do preview quando o link cai no grupo do WhatsApp.
 *
 * Renderizada por Satori, que só entende um subconjunto de CSS: estilos inline,
 * flexbox e cores literais. Nada de Tailwind, de `oklch` nem de `display: grid`
 * aqui — por isso a paleta aparece em hexadecimal, aproximando os tokens.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Capa da missão";

const NIGHT = "#14101f";
const EMBER = "#f5b950";
const INK = "#eeecf2";
const MUTED = "#b8b2c6";

export default async function OpengraphImage({
  params,
}: {
  // Next 16: params é Promise também nas funções geradoras de imagem.
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getGameBySlug(slug);
  const game = result?.game;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: NIGHT,
          backgroundImage: `radial-gradient(circle at 50% -20%, #3a2a66 0%, ${NIGHT} 60%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: EMBER,
            fontWeight: 600,
          }}
        >
          {game?.theme ?? "Missões"}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 76,
            lineHeight: 1.1,
            color: INK,
            fontWeight: 700,
          }}
        >
          {game?.title ?? "Uma jornada para a aula de hoje"}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 32,
            color: MUTED,
          }}
        >
          {game
            ? `${game.steps.length} ${game.steps.length === 1 ? "missão" : "missões"} · dá para fazer pelo celular`
            : "Toque para começar"}
        </div>
      </div>
    ),
    size,
  );
}
