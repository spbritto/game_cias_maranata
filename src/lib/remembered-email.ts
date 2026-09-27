/**
 * E-mail do professor lembrado neste aparelho, para a tela de login já abrir
 * preenchida. Só o e-mail — a senha fica com o gerenciador de senhas do
 * navegador, que é quem sabe guardá-la direito.
 *
 * Toda leitura e escrita vai em try/catch: aba anônima ou armazenamento
 * bloqueado lançam, e isso não pode impedir ninguém de entrar.
 */

const KEY = "professor:email";

export function readRememberedEmail(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function rememberEmail(email: string): void {
  try {
    window.localStorage.setItem(KEY, email.trim().toLowerCase());
  } catch {
    // Sem armazenamento: só não lembra da próxima vez.
  }
}

export function forgetEmail(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Idem.
  }
}
