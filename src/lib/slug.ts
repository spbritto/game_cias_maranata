import { customAlphabet } from "nanoid";
import { appUrl } from "./app-url";

/**
 * Alfabeto sem 0/O/1/I/L: o codigo aparece na URL que o professor le em voz alta
 * na sala e que o adolescente as vezes digita a mao em vez de tocar no link.
 */
const UNAMBIGUOUS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const randomCode = customAlphabet(UNAMBIGUOUS, 4);

/** "Proposito e vida crista" -> "proposito-e-vida-crista" */
export function kebab(input: string, maxLength = 40): string {
  const slug = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= maxLength) return slug;
  // corta na ultima palavra inteira que couber
  return slug.slice(0, maxLength).replace(/-[^-]*$/, "");
}

/**
 * Gera o slug publico do jogo: "proposito-7H3K".
 *
 * Chamado UMA vez, na primeira publicacao. Editar tema ou titulo depois nao
 * regenera o slug — links ja compartilhados no grupo nao podem quebrar.
 */
export function buildGameSlug(theme: string): string {
  const base = kebab(theme) || "missao";
  return `${base}-${randomCode()}`;
}

/** URL completa e compartilhavel do jogo. Usada no link, no QR Code e no OG. */
export function gameUrl(slug: string, origin?: string): string {
  const base = origin ? origin.replace(/\/$/, "") : appUrl();
  return `${base}/jogar/${slug}`;
}
