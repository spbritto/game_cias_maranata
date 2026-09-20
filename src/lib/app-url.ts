/**
 * URL pública da aplicação, sem barra no fim.
 *
 * Ordem: variável explícita → URL de produção que a Vercel injeta sozinha →
 * localhost. Assim o deploy funciona sem configurar nada além do banco, e
 * `NEXT_PUBLIC_APP_URL` só é necessária para apontar um domínio próprio.
 */
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
