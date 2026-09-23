import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Sessão do professor: JWT assinado em cookie httpOnly.
 *
 * Sem tabela de sessões de propósito — com poucos professores, uma consulta ao
 * banco por request só para validar sessão não se paga. O custo é não haver
 * revogação imediata: trocar `AUTH_SECRET` derruba todo mundo, que é o botão de
 * emergência aceitável nessa escala.
 */

const COOKIE = "missoes_sessao";
const ALG = "HS256";
/** 30 dias: o professor usa isto uma vez por semana, no máximo. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error(
      "AUTH_SECRET ausente. Gere com: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\" e coloque em .env.local.",
    );
  }
  return new TextEncoder().encode(value);
}

export async function createSession(teacherId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(teacherId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Devolve o id do professor, ou null se não há sessão válida. Nunca lança. */
export async function readSession(): Promise<{ teacherId: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: [ALG],
    });
    return payload.sub ? { teacherId: payload.sub } : null;
  } catch {
    // Expirado, adulterado ou assinado com outro segredo: trata como deslogado.
    return null;
  }
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** Só o nome do cookie, para o proxy checar presença sem verificar assinatura. */
export const SESSION_COOKIE = COOKIE;
