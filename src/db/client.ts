import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Driver HTTP do Neon, não TCP. Em serverless cada invocação abriria a própria
 * conexão e o limite do Postgres estoura rápido; o driver HTTP não mantém
 * conexão aberta. O custo é não haver transação interativa — onde ela for
 * necessária (reordenar etapas), usar `db.batch`, que envia tudo numa chamada.
 */

export type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | undefined;

function connect(): Database {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL ausente. Copie .env.example para .env.local e preencha com a connection string do Neon.",
    );
  }

  cached = drizzle(neon(url), { schema, casing: "snake_case" });
  return cached;
}

/**
 * Inicialização preguiçosa por trás de um Proxy: mantém a ergonomia de
 * `db.select()` sem avaliar DATABASE_URL no momento do import. Sem isso, um
 * `next build` em máquina sem a variável quebraria em qualquer rota que apenas
 * importasse este módulo, em vez de quebrar em quem de fato consulta o banco.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(connect(), prop, receiver);
  },
});
