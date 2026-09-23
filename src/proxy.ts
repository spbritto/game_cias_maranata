import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Redireciona quem chega na área do professor sem cookie de sessão.
 *
 * Isto é conveniência de navegação, NÃO autorização: o proxy só olha a
 * presença do cookie, sem verificar a assinatura. Quem forjar um cookie
 * qualquer passa por aqui e esbarra no `requireTeacher()` da camada de dados,
 * que é onde a verificação real acontece. Manter a checagem barata aqui é o
 * que o próprio Next recomenda — o proxy roda antes do render, às vezes na
 * borda, e não deve depender de banco.
 *
 * No Next 16 este arquivo se chama `proxy` (antes `middleware`) e roda sempre
 * no runtime Node.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const url = new URL("/entrar", request.url);
  // Depois de entrar, volta para onde a pessoa queria ir.
  const wanted = request.nextUrl.pathname + request.nextUrl.search;
  if (wanted !== "/painel") url.searchParams.set("destino", wanted);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/painel/:path*", "/jogos/:path*"],
};
