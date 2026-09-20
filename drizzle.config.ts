import type { Config } from "drizzle-kit";

// drizzle-kit nao enxerga .env.local (convencao do Next), entao carregamos na mao.
// process.loadEnvFile existe a partir do Node 21; o projeto exige Node 20.9+ por
// causa do Next 16, entao cai no catch em Node 20 e depende de env ja exportada.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local ausente ou Node sem suporte — segue com o que estiver no ambiente.
}

// `generate` so le o schema e escreve SQL — nao precisa de banco. Os demais
// comandos (migrate, push, studio) falam com o Neon, entao la a variavel e
// obrigatoria e vale falhar cedo com uma mensagem util.
const offlineCommand = process.argv.includes("generate");

if (!process.env.DATABASE_URL && !offlineCommand) {
  throw new Error(
    "DATABASE_URL ausente. Copie .env.example para .env.local e preencha com a connection string do Neon.",
  );
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  casing: "snake_case",
} satisfies Config;
