import { Compass } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";

/**
 * Página raiz. Nesta primeira versão o adolescente chega direto pelo link da
 * missão, então aqui basta dizer o que isto é — sem botão para uma área que
 * ainda não existe. O acesso do professor entra na Fase 3.
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
      </main>
    </>
  );
}
