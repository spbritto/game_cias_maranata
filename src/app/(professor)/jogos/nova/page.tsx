import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";
import { NovaAula } from "@/components/professor/nova-aula";

export const metadata: Metadata = { title: "Nova aula" };

/**
 * Vale para as Server Actions chamadas desta página (docs do Next 16,
 * route-segment-config/maxDuration). A geração pela IA leva de 20 a 60s, e o
 * padrão da plataforma cortaria antes.
 */
export const maxDuration = 120;

/**
 * Escolha de como começar a aula: a partir do PDF da aula escrita (o caminho
 * principal) ou em branco. A página em si é estática — não lê sessão; quem
 * chega aqui sem cookie é barrado pelo `proxy.ts`, e as actions conferem a
 * sessão de verdade com `requireTeacher()`.
 */
export default function NovaAulaPage() {
  return (
    <>
      <Starfield />
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <Link
          href="/painel"
          className="inline-flex min-h-touch items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Painel
        </Link>

        <header className="mt-6">
          <p className="text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase">
            Nova aula
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">
            Como você quer começar?
          </h1>
        </header>

        <div className="mt-8">
          <NovaAula />
        </div>
      </main>
    </>
  );
}
