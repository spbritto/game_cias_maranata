"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRight, Compass, RotateCcw } from "lucide-react";
import { PrimaryButton } from "./step-view";
import type { PlayableGame } from "@/lib/game";

/**
 * Tela de abertura (seção 13 do descritivo).
 *
 * A entrada escalonada aqui é CSS (`.enter` + `--i`), não Motion, de propósito:
 * esta é a tela que sai do servidor quando o link é aberto, e ela precisa
 * aparecer no primeiro paint mesmo que o JavaScript ainda esteja chegando.
 * As outras telas só existem depois da interação, e lá o Motion é livre.
 *
 * O apelido é opcional e não vai para lugar nenhum além do próprio aparelho —
 * a primeira versão evita cadastro, senha ou e-mail.
 */
export function StartScreen({
  game,
  savedNickname,
  canResume,
  onStart,
  onResume,
}: {
  game: PlayableGame;
  savedNickname: string | null;
  canResume: boolean;
  onStart: (nickname: string | null) => void;
  onResume: () => void;
}) {
  const [nickname, setNickname] = useState(savedNickname ?? "");

  return (
    <div className="flex min-h-dvh flex-col justify-center gap-8 py-12">
      <div className="flex flex-col gap-4">
        <span
          className="enter-pop flex size-14 items-center justify-center rounded-full border border-ember-500/30 bg-ember-500/10 text-ember-400"
          style={order(0)}
        >
          <Compass aria-hidden className="size-7" />
        </span>

        <p
          className="enter text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase"
          style={order(1)}
        >
          {game.theme}
        </p>

        <h1
          className="enter text-4xl leading-tight font-semibold text-ink"
          style={order(2)}
        >
          {game.title}
        </h1>

        {game.description ? (
          <p
            className="enter text-lg leading-relaxed text-ink-muted"
            style={order(3)}
          >
            {game.description}
          </p>
        ) : null}

        <p className="enter text-sm text-ink-subtle" style={order(4)}>
          {game.steps.length}{" "}
          {game.steps.length === 1 ? "missão" : "missões"} · dá para fazer pelo
          celular
        </p>
      </div>

      {canResume ? (
        <div className="enter flex flex-col gap-3" style={order(5)}>
          <PrimaryButton onClick={onResume} breathe>
            Continuar de onde parei
            <ArrowRight aria-hidden className="size-5" />
          </PrimaryButton>
          <button
            type="button"
            onClick={() => onStart(nickname.trim() || null)}
            className="flex min-h-touch items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            <RotateCcw aria-hidden className="size-4" />
            Começar de novo
          </button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            onStart(nickname.trim() || null);
          }}
        >
          <div className="enter flex flex-col gap-2" style={order(5)}>
            <label
              htmlFor="apelido"
              className="text-sm font-medium text-ink-muted"
            >
              Como você quer ser chamado?
            </label>
            <input
              id="apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={40}
              autoComplete="off"
              placeholder="Opcional"
              /* text-base: abaixo de 16px o iOS dá zoom ao focar o campo. */
              className="min-h-touch w-full rounded-field border border-line bg-surface-raised px-4 text-base text-ink transition-colors placeholder:text-ink-subtle focus:border-aurora-400"
            />
          </div>

          <div className="enter" style={order(6)}>
            <PrimaryButton type="submit" breathe>
              Começar missão
              <ArrowRight aria-hidden className="size-5" />
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}

/** Posição na sequência de entrada — vira o atraso da animação via `--i`. */
function order(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
