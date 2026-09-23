import "server-only";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { findTeacherById } from "@/db/queries/teachers";
import { readSession } from "./session";

/**
 * Camada de acesso aos dados do professor (Data Access Layer).
 *
 * Toda leitura e toda escrita da área do professor passa por aqui. O `proxy.ts`
 * redireciona quem não tem cookie, mas isso é só experiência de navegação: a
 * autorização de verdade é feita aqui, no servidor, junto do dado.
 */

export type CurrentTeacher = {
  id: string;
  name: string;
  email: string;
};

/**
 * Para renderização. `use cache: private` deixa o resultado no navegador do
 * próprio professor durante o `stale` e nunca em cache de servidor — é o que
 * evita reler a sessão a cada componente sem vazar sessão entre pessoas.
 *
 * `redirect()` lança em vez de retornar, então uma sessão inválida nunca entra
 * no cache: só um professor resolvido é guardado.
 */
export async function getCurrentTeacher(): Promise<CurrentTeacher> {
  "use cache: private";
  // `stale` abaixo de 30s tiraria a rota do prefetch; minutes fica bem acima.
  cacheLife("minutes");

  const session = await readSession();
  if (!session) redirect("/entrar");

  const teacher = await findTeacherById(session.teacherId);
  if (!teacher) redirect("/entrar");

  return teacher;
}

/**
 * Para Server Actions. Igual à de cima, porém sem cache: uma ação que muda
 * dados tem que reler a sessão do request, não reaproveitar nada — é o que
 * impede o cliente de escolher em nome de quem a ação roda.
 */
export async function requireTeacher(): Promise<CurrentTeacher> {
  const session = await readSession();
  if (!session) redirect("/entrar");

  const teacher = await findTeacherById(session.teacherId);
  if (!teacher) redirect("/entrar");

  return teacher;
}
