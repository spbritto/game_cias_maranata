import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (Next 16). Habilita `use cache`, `cacheTag` e `cacheLife`,
  // que sao o mecanismo usado para servir a pagina publica do jogo sem tocar
  // no Neon a cada acesso. Ver .claude/plans/PLANO_EXECUCAO.md secao 2.
  cacheComponents: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          /*
            Impede que a area do professor seja embutida em iframe de outro
            site — sem isso, da para sobrepor uma pagina falsa e capturar
            cliques em Publicar ou Excluir (clickjacking). `frame-ancestors`
            e a versao moderna do X-Frame-Options e cobre o mesmo caso.
          */
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          // Navegador nao "adivinha" tipo de conteudo, o que evita tratar um
          // upload ou resposta de texto como script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // O link do jogo circula no WhatsApp: nao vazar o caminho completo
          // (que contem o slug) para sites de terceiros.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
