"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { PrimaryButton } from "./step-view";
import type { PlayableGame } from "@/lib/game";

/**
 * Tela de abertura (seção 13 do descritivo).
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
        <p className="text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase">
          {game.theme}
        </p>
        <h1 className="text-4xl leading-tight font-semibold text-ink">
          {game.title}
        </h1>
        {game.description ? (
          <p className="text-lg leading-relaxed text-ink-muted">
            {game.description}
          </p>
        ) : null}
        <p className="text-sm text-ink-subtle">
          {game.steps.length}{" "}
          {game.steps.length === 1 ? "missão" : "missões"} · dá para fazer pelo
          celular
        </p>
      </div>

      {canResume ? (
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={onResume}>
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
          <div className="flex flex-col gap-2">
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
              className="min-h-touch w-full rounded-field border border-line bg-surface-raised px-4 text-base text-ink placeholder:text-ink-subtle"
            />
          </div>

          <PrimaryButton type="submit">
            Começar missão
            <ArrowRight aria-hidden className="size-5" />
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
