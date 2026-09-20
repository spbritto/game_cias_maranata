/**
 * Progresso do adolescente, guardado só no aparelho dele.
 *
 * Não é conveniência, é requisito: celular de adolescente trava e bloqueia no
 * meio da aula, e sem retomada ele perde a jornada e desiste. Nada disso vai
 * para o banco — a coleta de respostas ficou fora do MVP por decisão de produto
 * (seção 1.2 do plano).
 *
 * O módulo expõe o armazenamento como store externo (`subscribe` + `readRaw`),
 * para que o runtime leia com `useSyncExternalStore` em vez de hidratar via
 * efeito. É o que mantém uma fonte única de verdade e evita render em cascata.
 */

const VERSION = 1;
const EVENT = "missoes:progress";

const keyFor = (slug: string) => `missoes:v${VERSION}:${slug}`;

/**
 * Espelho em memória para quando o `localStorage` não está disponível — aba
 * anônima, armazenamento bloqueado, cota estourada. Sem isso o jogo congelaria
 * nesses casos, já que o estado passaria a não ter onde ser escrito.
 */
const fallback = new Map<string, string>();

export type PlayerAnswer =
  /** choice, scenario e reflection — reflection pode ter mais de um id. */
  | { kind: "option"; optionIds: string[] }
  /** true_false */
  | { kind: "boolean"; value: boolean }
  /** open_question */
  | { kind: "text"; value: string }
  /** verse — não há o que responder, só registra que foi visto. */
  | { kind: "seen" };

export type PlayerProgress = {
  nickname: string | null;
  /** Índice da etapa atual. Igual ao total de etapas = jogo concluído. */
  currentIndex: number;
  /** Chaveado pelo id da etapa, não pela posição: reordenar não embaralha. */
  answers: Record<string, PlayerAnswer>;
  startedAt: string;
};

/** Estado de quem ainda não começou. Congelado: é comparado por identidade. */
export const BLANK_PROGRESS: PlayerProgress = Object.freeze({
  nickname: null,
  currentIndex: 0,
  answers: {},
  startedAt: "",
});

export function newProgress(nickname: string | null): PlayerProgress {
  return {
    nickname,
    currentIndex: 0,
    answers: {},
    startedAt: new Date().toISOString(),
  };
}

// --- store externo --------------------------------------------------------

/** `storage` cobre outras abas; o evento próprio cobre as escritas daqui. */
export function subscribeProgress(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * Snapshot cru. Devolve string (ou null) de propósito: `useSyncExternalStore`
 * compara por identidade, e um primitivo é estável entre renders — um objeto
 * recém-parseado causaria laço infinito.
 */
export function readRawProgress(slug: string): string | null {
  const key = keyFor(slug);
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    // cai para o espelho em memória
  }
  return fallback.get(key) ?? null;
}

export function writeProgress(slug: string, progress: PlayerProgress): void {
  const key = keyFor(slug);
  const value = JSON.stringify(progress);
  try {
    window.localStorage.setItem(key, value);
    fallback.delete(key);
  } catch {
    fallback.set(key, value);
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearProgress(slug: string): void {
  const key = keyFor(slug);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // nada a fazer
  }
  fallback.delete(key);
  window.dispatchEvent(new Event(EVENT));
}

// --- desserialização ------------------------------------------------------

export function parseProgress(raw: string | null): PlayerProgress | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? parsed : null;
  } catch {
    // Conteúdo corrompido: começa do zero, que é degradação aceitável —
    // nunca uma tela de erro.
    return null;
  }
}

/** Validação defensiva: o conteúdo veio do disco do usuário, não do servidor. */
function isProgress(value: unknown): value is PlayerProgress {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.nickname === null || typeof v.nickname === "string") &&
    typeof v.currentIndex === "number" &&
    Number.isInteger(v.currentIndex) &&
    v.currentIndex >= 0 &&
    typeof v.answers === "object" &&
    v.answers !== null &&
    typeof v.startedAt === "string"
  );
}
