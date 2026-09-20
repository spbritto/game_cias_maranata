import { Compass } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";

export default function NotFound() {
  return (
    <>
      <Starfield />
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-5 text-center">
        <Compass aria-hidden className="mx-auto size-10 text-ember-400" />
        <h1 className="text-2xl font-semibold text-ink">
          Esse caminho não leva a lugar nenhum
        </h1>
        <p className="leading-relaxed text-ink-muted">
          O endereço pode ter vindo com alguma letra trocada. Se você recebeu um
          link de missão, vale conferir com quem mandou.
        </p>
      </main>
    </>
  );
}
