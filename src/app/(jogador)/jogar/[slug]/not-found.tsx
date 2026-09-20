import { Compass } from "lucide-react";

export default function GameNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-5 text-center">
      <Compass aria-hidden className="mx-auto size-10 text-ember-400" />
      <h1 className="text-2xl font-semibold text-ink">
        Não achamos essa missão
      </h1>
      <p className="leading-relaxed text-ink-muted">
        O link pode ter sido digitado com alguma letra trocada, ou a missão ainda
        não foi publicada. Vale conferir com o professor.
      </p>
    </main>
  );
}
