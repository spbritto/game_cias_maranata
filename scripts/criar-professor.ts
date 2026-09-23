/**
 * Cadastra um professor. Não existe autocadastro no sistema — é assim que as
 * contas nascem.
 *
 * Uso:
 *   npm run criar-professor -- "Nome" email@exemplo.com
 *
 * A senha é gerada e impressa uma única vez. Rodar de novo com o mesmo e-mail
 * troca a senha do professor existente.
 */
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { teachers } from "../src/db/schema";

function generatePassword(): string {
  // 12 caracteres legíveis, sem os que se confundem ao ditar por telefone.
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function main() {
  const [name, rawEmail] = process.argv.slice(2);

  if (!name || !rawEmail) {
    console.error('Uso: npm run criar-professor -- "Nome" email@exemplo.com');
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`E-mail inválido: ${email}`);
    process.exit(1);
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.email, email));

  if (existing) {
    await db
      .update(teachers)
      .set({ name, passwordHash, updatedAt: new Date() })
      .where(eq(teachers.id, existing.id));
    console.log(`\nSenha trocada para ${email}.`);
  } else {
    await db.insert(teachers).values({ name, email, passwordHash });
    console.log(`\nProfessor ${name} cadastrado.`);
  }

  console.log("\n  E-mail: " + email);
  console.log("  Senha:  " + password);
  console.log("\nAnote agora — a senha não é recuperável, só substituível.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Falhou:", error);
    process.exit(1);
  });
