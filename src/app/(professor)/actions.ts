"use server";

import { revalidateTag, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, notInArray, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { games, steps, teachers } from "@/db/schema";
import { findTeacherByEmail } from "@/db/queries/teachers";
import {
  findOwnedGame,
  gameDraftTag,
  teacherGamesTag,
} from "@/db/queries/teacher-games";
import { gameTag } from "@/db/queries/games";
import { requireTeacher } from "@/lib/auth";
import { verifyInviteCode } from "@/lib/invite";
import { createSession, destroySession } from "@/lib/session";
import {
  findPublishProblems,
  gameDraftSchema,
  toPublishedConclusion,
  toPublishedStep,
  type PublishProblem,
} from "@/lib/schemas/game";
import type { ConclusionDraft } from "@/lib/schemas/step-draft";
import { buildGameSlug } from "@/lib/slug";

/**
 * Toda ação relê a sessão por `requireTeacher()` e confere a posse do jogo
 * antes de escrever. Nenhuma confia no id que o cliente mandou — é o que
 * impede alguém logado de editar jogo de outro professor trocando a URL.
 */

// --- sessão ---------------------------------------------------------------

export type LoginState = { error: string | null };

/**
 * Hash descartável, com custo igual ao real, usado quando o e-mail não existe.
 * Sem ele a resposta voltaria na hora nesse caso e devagar quando o e-mail
 * existe — diferença suficiente para descobrir quais e-mails estão cadastrados.
 */
const DUMMY_HASH = bcrypt.hashSync("senha-que-nao-existe", 12);

export async function entrarAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("senha") ?? "");
  const destino = String(formData.get("destino") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const teacher = await findTeacherByEmail(email);
  // O professor criado pelo seed tem hash propositalmente inválido, e o bcrypt
  // lança ao tentar compará-lo. Tratar como "não confere" em vez de erro 500.
  const matches = await bcrypt
    .compare(password, teacher?.passwordHash ?? DUMMY_HASH)
    .catch(() => false);

  if (!teacher || !matches) {
    // Mesma mensagem nos dois casos, de propósito.
    return { error: "E-mail ou senha não conferem." };
  }

  await createSession(teacher.id);
  redirect(safeInternalPath(destino));
}

/**
 * Caminho interno seguro para o redirecionamento pós-login.
 *
 * `destino` vem da query string, então um link forjado poderia mandar o
 * professor para fora do site logo depois de um login legítimo — phishing com
 * o aval do nosso domínio. Barra dupla vira URL protocol-relative, e o
 * navegador normaliza contrabarra para barra, então `/\evil.com` também
 * escaparia. Os dois casos caem fora, junto de caracteres de controle.
 */
function safeInternalPath(value: string): string {
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "");
  return /^\/(?![/\\])\S*$/.test(cleaned) ? cleaned : "/painel";
}

export type CadastroState = { error: string | null };

/**
 * Cadastro de professor pela própria tela de login, atrás de um código de
 * convite (`TEACHER_INVITE_CODE`). Substitui `scripts/criar-professor.ts`
 * como porta de entrada usual — o script continua existindo para quando não
 * há acesso a ninguém que já tenha o código.
 */
export async function cadastrarAction(
  _prev: CadastroState,
  formData: FormData,
): Promise<CadastroState> {
  const name = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("senha") ?? "");
  const invite = String(formData.get("convite") ?? "");
  const destino = String(formData.get("destino") ?? "");

  if (!name || !email || !password || !invite) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (!verifyInviteCode(invite)) {
    return { error: "Código de convite incorreto." };
  }

  // Diferente do login, aqui é normal dizer que o e-mail já existe: quem está
  // se cadastrando se beneficia de saber que já tem conta, e ninguém aprende
  // nada que um convite válido não desse acesso de qualquer forma.
  const existing = await findTeacherByEmail(email);
  if (existing) {
    return { error: "Esse e-mail já tem cadastro. Tente entrar." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let teacher: { id: string };
  try {
    [teacher] = await db
      .insert(teachers)
      .values({ name, email, passwordHash })
      .returning({ id: teachers.id });
  } catch (error) {
    // A checagem acima não fecha a janela entre duas pessoas cadastrando o
    // mesmo e-mail ao mesmo tempo — quem perde a corrida esbarra na
    // constraint `unique` do banco. Sem isso viraria erro 500 em vez de uma
    // mensagem normal.
    if (isUniqueViolation(error)) {
      return { error: "Esse e-mail já tem cadastro. Tente entrar." };
    }
    throw error;
  }

  await createSession(teacher.id);
  redirect(safeInternalPath(destino));
}

/**
 * Código `23505` do Postgres: violação de restrição única.
 *
 * O Drizzle envolve o erro do driver num `DrizzleQueryError` — o código real
 * fica em `error.cause.code`, não em `error.code`. Confirmado com um teste
 * direto contra o Neon antes de confiar nisso; sem checar `.cause`, toda
 * corrida de cadastro simultâneo com o mesmo e-mail viraria erro 500 em vez
 * da mensagem amigável.
 */
function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: unknown; cause?: { code?: unknown } })?.code;
  if (code === "23505") return true;

  const causeCode = (error as { cause?: { code?: unknown } })?.cause?.code;
  return causeCode === "23505";
}

export async function sairAction(): Promise<void> {
  await destroySession();
  redirect("/entrar");
}

export type AlterarSenhaState = { error: string | null; success: boolean };

/**
 * Troca a senha do professor logado. Não é `sairAction` — a sessão atual
 * continua valendo depois (não há tabela de sessões para revogar as outras,
 * a mesma limitação que `session.ts` já documenta: só trocar `AUTH_SECRET`
 * derruba todo mundo de uma vez).
 */
export async function alterarSenhaAction(
  _prev: AlterarSenhaState,
  formData: FormData,
): Promise<AlterarSenhaState> {
  const teacher = await requireTeacher();

  const atual = String(formData.get("senhaAtual") ?? "");
  const nova = String(formData.get("novaSenha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (!atual || !nova || !confirmacao) {
    return { error: "Preencha todos os campos.", success: false };
  }
  if (nova.length < 8) {
    return {
      error: "A nova senha precisa ter pelo menos 8 caracteres.",
      success: false,
    };
  }
  if (nova !== confirmacao) {
    return { error: "A confirmação não bate com a nova senha.", success: false };
  }

  // `requireTeacher()` não devolve o hash (é a interface pública do
  // professor); busca-se a linha completa aqui, só para comparar a senha.
  const [row] = await db
    .select({ passwordHash: teachers.passwordHash })
    .from(teachers)
    .where(eq(teachers.id, teacher.id));

  const matches = await bcrypt
    .compare(atual, row?.passwordHash ?? DUMMY_HASH)
    .catch(() => false);

  if (!row || !matches) {
    return { error: "A senha atual não confere.", success: false };
  }
  if (atual === nova) {
    return {
      error: "A nova senha precisa ser diferente da atual.",
      success: false,
    };
  }

  const passwordHash = await bcrypt.hash(nova, 12);
  await db
    .update(teachers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(teachers.id, teacher.id));

  return { error: null, success: true };
}

// --- jogos ----------------------------------------------------------------

export async function criarJogoAction(): Promise<void> {
  const teacher = await requireTeacher();

  const [game] = await db
    .insert(games)
    .values({
      teacherId: teacher.id,
      title: "Nova aula",
      theme: "",
      conclusion: null,
      status: "draft",
    })
    .returning({ id: games.id });

  updateTag(teacherGamesTag(teacher.id));
  redirect(`/jogos/${game.id}/editar`);
}

export type SaveResult = { ok: boolean; savedAt: number; error?: string };

/**
 * Autosave do editor. Recebe o rascunho inteiro — um jogo tem alguns kB, e
 * mandar tudo evita todo o aparato de diff por campo.
 */
export async function salvarJogoAction(
  gameId: string,
  payload: unknown,
): Promise<SaveResult> {
  const teacher = await requireTeacher();

  const owned = await findOwnedGame(gameId, teacher.id);
  if (!owned) {
    return { ok: false, savedAt: Date.now(), error: "Jogo não encontrado." };
  }

  const parsed = gameDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      savedAt: Date.now(),
      error: "Não consegui salvar: o conteúdo ficou em formato inesperado.",
    };
  }

  const draft = parsed.data;

  await db
    .update(games)
    .set({
      title: draft.info.title,
      theme: draft.info.theme,
      objective: draft.info.objective,
      mainScripture: draft.info.mainScripture,
      description: draft.info.description,
      conclusion: conclusionForStorage(draft.conclusion),
      updatedAt: new Date(),
    })
    .where(eq(games.id, gameId));

  /*
    Ids das etapas são gerados no cliente e nunca mudam depois de criados: é o
    que mantém o progresso já salvo no celular do adolescente apontando para a
    etapa certa quando o professor edita um jogo publicado.
  */
  if (draft.steps.length) {
    await db
      .insert(steps)
      .values(
        draft.steps.map((step, index) => ({
          id: step.id,
          gameId,
          position: index,
          type: step.data.type,
          data: step.data,
        })),
      )
      .onConflictDoUpdate({
        target: steps.id,
        set: {
          position: sql`excluded.position`,
          type: sql`excluded.type`,
          data: sql`excluded.data`,
          updatedAt: new Date(),
        },
      });
  }

  const keptIds = draft.steps.map((step) => step.id);
  await db
    .delete(steps)
    .where(
      keptIds.length
        ? and(eq(steps.gameId, gameId), notInArray(steps.id, keptIds))
        : eq(steps.gameId, gameId),
    );

  updateTag(gameDraftTag(gameId));
  updateTag(teacherGamesTag(teacher.id));
  // Editar jogo publicado tem efeito imediato no link já compartilhado.
  if (owned.slug) revalidateTag(gameTag(owned.slug), "max");

  return { ok: true, savedAt: Date.now() };
}

export type PublishResult = {
  ok: boolean;
  slug?: string;
  problems?: PublishProblem[];
};

export async function publicarJogoAction(
  gameId: string,
  payload: unknown,
): Promise<PublishResult> {
  const teacher = await requireTeacher();

  const owned = await findOwnedGame(gameId, teacher.id);
  if (!owned) {
    return {
      ok: false,
      problems: [{ step: null, message: "Jogo não encontrado." }],
    };
  }

  const parsed = gameDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      problems: [
        { step: null, message: "O conteúdo ficou em formato inesperado." },
      ],
    };
  }

  const draft = parsed.data;
  const problems = findPublishProblems(draft);
  if (problems.length) return { ok: false, problems };

  // Grava o rascunho antes, para publicado e editor nunca divergirem.
  const saved = await salvarJogoAction(gameId, payload);
  if (!saved.ok) {
    return {
      ok: false,
      problems: [{ step: null, message: saved.error ?? "Falha ao salvar." }],
    };
  }

  // Slug nasce na primeira publicação e nunca muda: link já compartilhado no
  // grupo não pode quebrar porque o professor renomeou o tema.
  const slug = owned.slug ?? buildGameSlug(draft.info.theme || draft.info.title);

  await db
    .update(games)
    .set({
      status: "published",
      slug,
      publishedAt: new Date(),
      conclusion: toPublishedConclusion(draft.conclusion),
      updatedAt: new Date(),
    })
    .where(eq(games.id, gameId));

  // Reescreve as etapas já no formato estrito que o jogador espera.
  for (const step of draft.steps) {
    await db
      .update(steps)
      .set({ data: toPublishedStep(step.data), updatedAt: new Date() })
      .where(eq(steps.id, step.id));
  }

  updateTag(gameDraftTag(gameId));
  updateTag(teacherGamesTag(teacher.id));
  revalidateTag(gameTag(slug), "max");

  return { ok: true, slug };
}

export async function encerrarJogoAction(gameId: string): Promise<void> {
  const teacher = await requireTeacher();
  const owned = await findOwnedGame(gameId, teacher.id);
  if (!owned) return;

  await db
    .update(games)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(games.id, gameId));

  updateTag(teacherGamesTag(teacher.id));
  if (owned.slug) revalidateTag(gameTag(owned.slug), "max");
}

export async function reabrirJogoAction(gameId: string): Promise<void> {
  const teacher = await requireTeacher();
  const owned = await findOwnedGame(gameId, teacher.id);
  if (!owned?.slug) return;

  await db
    .update(games)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(games.id, gameId));

  updateTag(teacherGamesTag(teacher.id));
  revalidateTag(gameTag(owned.slug), "max");
}

export async function duplicarJogoAction(gameId: string): Promise<void> {
  const teacher = await requireTeacher();

  const [original] = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.teacherId, teacher.id)));
  if (!original) return;

  const originalSteps = await db
    .select()
    .from(steps)
    .where(eq(steps.gameId, gameId));

  // Cópia nasce rascunho e sem slug: publicar de novo gera link próprio.
  const [copy] = await db
    .insert(games)
    .values({
      teacherId: teacher.id,
      title: `${original.title} (cópia)`,
      theme: original.theme,
      objective: original.objective,
      mainScripture: original.mainScripture,
      description: original.description,
      conclusion: original.conclusion,
      status: "draft",
      slug: null,
      publishedAt: null,
    })
    .returning({ id: games.id });

  if (originalSteps.length) {
    await db.insert(steps).values(
      [...originalSteps]
        .sort((a, b) => a.position - b.position)
        .map((step, index) => ({
          gameId: copy.id,
          position: index,
          type: step.type,
          data: step.data,
        })),
    );
  }

  updateTag(teacherGamesTag(teacher.id));
  redirect(`/jogos/${copy.id}/editar`);
}

export async function excluirJogoAction(gameId: string): Promise<void> {
  const teacher = await requireTeacher();
  const owned = await findOwnedGame(gameId, teacher.id);
  if (!owned) return;

  // As etapas vão junto pelo cascade do schema.
  await db.delete(games).where(eq(games.id, gameId));

  updateTag(teacherGamesTag(teacher.id));
  if (owned.slug) revalidateTag(gameTag(owned.slug), "max");
  redirect("/painel");
}

// --- auxiliares -----------------------------------------------------------

/** Conclusão ainda em branco fica null no banco, e não um objeto vazio. */
function conclusionForStorage(draft: ConclusionDraft): ConclusionDraft | null {
  const hasContent =
    draft.message.trim() ||
    draft.discussionQuestion.trim() ||
    draft.scriptureRef.trim() ||
    draft.diagram.some((entry) => entry.trim());

  return hasContent ? draft : null;
}
