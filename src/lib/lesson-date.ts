/**
 * Domingo da aula.
 *
 * As aulas da EBD são identificadas pelo domingo do mês ("4ª aula") e pela
 * data. Tudo aqui trabalha com a data como string `YYYY-MM-DD` e faz as contas
 * em UTC: é um dia do calendário, não um instante. Com `new Date("2026-09-27")`
 * formatado no fuso de Brasília, a data viraria sábado, dia 26.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** `YYYY-MM-DD` válido de verdade (sem 31/02). */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = toUtc(value);
  return date.toISOString().slice(0, 10) === value;
}

function toUtc(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isSunday(value: string): boolean {
  return toUtc(value).getUTCDay() === 0;
}

/**
 * Qual domingo do mês é este: dia 1–7 → 1ª aula, 8–14 → 2ª, e assim por
 * diante. Vale para qualquer dia (um sábado dia 26 conta como o 4º).
 */
export function sundayOrdinal(value: string): number {
  return Math.ceil(toUtc(value).getUTCDate() / 7);
}

/**
 * Próximo domingo a partir de hoje, contando hoje se já for domingo — quem
 * monta a aula no domingo de manhã está montando a aula de hoje.
 *
 * `today` é a data local do professor em `YYYY-MM-DD`. No servidor, calcular
 * com o fuso de Brasília; ver `todayInBrazil()`.
 */
export function nextSunday(today: string): string {
  const date = toUtc(today);
  const offset = (7 - date.getUTCDay()) % 7;
  date.setUTCDate(date.getUTCDate() + offset);
  return toIso(date);
}

/**
 * Data de hoje em Brasília. O servidor da Vercel roda em UTC, então um "hoje"
 * calculado lá no sábado à noite já seria domingo.
 */
export function todayInBrazil(now: Date = new Date()): string {
  // en-CA formata como YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "4ª aula · 27/09" — selo curto, para o painel. */
export function lessonLabel(
  lessonNumber: number | null,
  lessonDate: string | null,
): string | null {
  const parts: string[] = [];
  if (lessonNumber) parts.push(`${lessonNumber}ª aula`);
  if (lessonDate && isIsoDate(lessonDate)) {
    const [, month, day] = lessonDate.split("-");
    parts.push(`${day}/${month}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** "4ª aula · 27 de setembro" — versão por extenso, para o adolescente. */
export function lessonLabelLong(
  lessonNumber: number | null,
  lessonDate: string | null,
): string | null {
  const parts: string[] = [];
  if (lessonNumber) parts.push(`${lessonNumber}ª aula`);
  if (lessonDate && isIsoDate(lessonDate)) {
    const date = toUtc(lessonDate);
    parts.push(`${date.getUTCDate()} de ${MONTHS[date.getUTCMonth()]}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** "Setembro de 2026" — cabeçalho do agrupamento no painel. */
export function monthLabel(lessonDate: string): string {
  const date = toUtc(lessonDate);
  const month = MONTHS[date.getUTCMonth()];
  return `${month[0].toUpperCase()}${month.slice(1)} de ${date.getUTCFullYear()}`;
}

/** Chave de agrupamento por mês: "2026-09". */
export function monthKey(lessonDate: string): string {
  return lessonDate.slice(0, 7);
}
