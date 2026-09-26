import Link from "next/link";
import { Compass } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";

/**
 * Página raiz. O adolescente chega direto pelo link da missão — esta tela é
 * vista principalmente pelo professor, então o link para a área dele fica
 * aqui. Não há cadastro aberto (decisão da seção 4 do plano): contas nascem
 * por `npm run criar-professor`, e quem não tem uma só vê esta apresentação.
 */
export default function Home() {
  return (
    <>
      <Starfield />
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-16">
        <span
          className="enter-pop flex size-14 items-center justify-center rounded-full border border-ember-500/30 bg-ember-500/10 text-ember-400"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          <Compass aria-hidden className="size-7" />
        </span>

        <p
          className="enter text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Aulas que viram jornada
        </p>

        <h1
          className="enter text-4xl leading-tight font-semibold text-ink"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Missões
        </h1>

        <p
          className="enter text-lg leading-relaxed text-ink-muted"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          O professor monta a aula, o adolescente recebe um link e atravessa a
          jornada pelo celular. A conversa continua na sala.
        </p>

        <p
          className="enter text-sm text-ink-subtle"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          O link da missão chega pelo professor.
        </p>

        <Link
          href="/entrar"
          className="enter mt-2 inline-flex min-h-touch w-fit items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-6 text-sm font-semibold text-ink hover:border-line-strong hover:bg-surface-overlay"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          Sou professor
        </Link>
      </main>
    </>
  );
}
