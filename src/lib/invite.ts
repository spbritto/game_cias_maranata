import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Confere o código de convite exigido no cadastro de professor pela tela de
 * login. Substitui o script `criar-professor.ts` como porta de entrada, mas
 * mantém a mesma intenção da seção 4 do plano: poucos professores, não
 * qualquer visitante que ache o site.
 *
 * `timingSafeEqual`, não `===`: mesmo sendo um segredo combinado por fora
 * (mensagem, conversa), uma comparação ingênua vaza quanto do começo da
 * string bateu através do tempo de resposta. Tamanhos diferentes já
 * respondem "não bate" sem comparar nada — o comprimento do que a pessoa
 * digitou não é segredo.
 */
export function verifyInviteCode(input: string): boolean {
  const expected = process.env.TEACHER_INVITE_CODE;
  if (!expected) return false;

  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
