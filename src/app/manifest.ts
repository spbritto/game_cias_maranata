import type { MetadataRoute } from "next";

/**
 * Manifesto PWA — sem service worker, como o plano define. Isso já basta para
 * "Adicionar à tela de início" abrir em tela cheia, com nome e ícone certos,
 * o que importa para o adolescente que joga o mesmo link várias vezes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Missões",
    short_name: "Missões",
    description:
      "Aulas cristãs com adolescentes que viram jornada: situações, escolhas e reflexão a partir da Bíblia.",
    start_url: "/",
    display: "standalone",
    background_color: "#14101f",
    theme_color: "#14101f",
    lang: "pt-BR",
    icons: [
      {
        src: "/manifest-icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/manifest-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/manifest-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
