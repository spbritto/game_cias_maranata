import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (Next 16). Habilita `use cache`, `cacheTag` e `cacheLife`,
  // que sao o mecanismo usado para servir a pagina publica do jogo sem tocar
  // no Neon a cada acesso. Ver .claude/plans/PLANO_EXECUCAO.md secao 2.
  cacheComponents: true,
};

export default nextConfig;
