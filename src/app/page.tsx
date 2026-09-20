import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium tracking-[0.2em] text-ember-400 uppercase">
          Aulas que viram jornada
        </p>
        <h1 className="text-4xl leading-tight font-semibold text-ink">
          Missoes
        </h1>
        <p className="text-lg leading-relaxed text-ink-muted">
          O professor monta a aula, o adolescente recebe um link e atravessa a
          jornada pelo celular. A conversa continua na sala.
        </p>
      </div>

      <Link
        href="/painel"
        className="flex min-h-touch items-center justify-center rounded-pill bg-accent px-6 text-base font-semibold text-night-950 transition-colors hover:bg-accent-soft"
      >
        Entrar como professor
      </Link>
    </main>
  );
}
