"use client";

import { MessageCircle, RotateCcw } from "lucide-react";
import { ScriptureCard } from "./scripture-card";

import type { PlayableGame, PlayableStep } from "@/lib/game";
import type { PlayerAnswer } from "@/lib/player-progress";
import { stepHeadline } from "@/lib/schemas/step";

/**
 * Tela de fechamento (seção 11 do descritivo) mais o recap das respostas.
 *
 * O recap é a compensação por não gravar respostas no servidor: o adolescente
 * vê o que respondeu e decide se manda para o professor pelo WhatsApp. A escolha
 * de compartilhar é dele, e nada sai do aparelho sem esse toque.
 */
export function ConclusionScreen({
  game,
  nickname,
  answers,
  onRestart,
}: {
  game: PlayableGame;
  nickname: string | null;
  answers: Record<string, PlayerAnswer>;
  onRestart: () => void;
}) {
  const conclusion = game.conclusion;
  const recap = game.steps
    .map((step) => ({ step, text: describeAnswer(step, answers[step.id]) }))
    .filter((row): row is { step: PlayableStep; text: string } =>
      Boolean(row.text),
    );

  return (
    <div className="flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase">
          {nickname ? `Boa, ${nickname}` : "Chegou ao fim"}
        </p>
        <h1 className="text-3xl leading-tight font-semibold text-ink">
          {conclusion?.title ?? "Missão concluída"}
        </h1>
        {conclusion?.message ? (
          <p className="text-lg leading-relaxed text-ink-muted">
            {conclusion.message}
          </p>
        ) : null}
      </header>

      {conclusion?.diagram?.length ? (
        <ol className="flex flex-col items-center gap-1">
          {conclusion.diagram.map((node, i) => (
            <li key={node} className="flex flex-col items-center gap-1">
              {i > 0 ? (
                <span aria-hidden className="h-5 w-px bg-ember-500/40" />
              ) : null}
              <span className="rounded-pill border border-ember-500/30 bg-ember-500/[0.07] px-5 py-2 text-sm font-semibold tracking-[0.12em] text-ember-300 uppercase">
                {node}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {conclusion?.scriptureRef ? (
        <ScriptureCard
          reference={conclusion.scriptureRef}
          text={conclusion.scriptureText}
        />
      ) : null}

      {conclusion?.discussionQuestion ? (
        <section className="rounded-card border border-aurora-500/30 bg-aurora-500/[0.08] p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-aurora-400 uppercase">
            Para conversar na aula
          </p>
          <p className="mt-2 leading-relaxed text-ink">
            {conclusion.discussionQuestion}
          </p>
        </section>
      ) : null}

      {recap.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">O que você respondeu</h2>
          <dl className="flex flex-col gap-4">
            {recap.map(({ step, text }) => (
              <div
                key={step.id}
                className="rounded-card border border-line bg-surface-raised p-4"
              >
                <dt className="text-sm text-ink-subtle">
                  {stepHeadline(step.data)}
                </dt>
                <dd className="mt-1 leading-relaxed text-ink">{text}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <div className="flex flex-col gap-3">
        {recap.length ? (
          <a
            href={whatsappLink(game, nickname, recap)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-touch w-full items-center justify-center gap-2 rounded-pill bg-accent px-6 text-base font-semibold text-night-950 transition-colors hover:bg-accent-soft"
          >
            <MessageCircle aria-hidden className="size-5" />
            Mandar pro professor
          </a>
        ) : null}

        <button
          type="button"
          onClick={onRestart}
          className="flex min-h-touch items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <RotateCcw aria-hidden className="size-4" />
          Jogar de novo
        </button>
      </div>
    </div>
  );
}

/** Converte a resposta guardada no aparelho em texto legível. */
function describeAnswer(
  step: PlayableStep,
  answer: PlayerAnswer | undefined,
): string | null {
  if (!answer) return null;
  const { data } = step;

  switch (answer.kind) {
    case "text":
      return answer.value || null;

    case "boolean":
      return answer.value ? "Verdadeiro" : "Falso";

    case "option": {
      if (data.type === "verse") return null;
      const labels = answer.optionIds
        .map((id) =>
          "options" in data
            ? data.options.find((o) => o.id === id)?.label
            : undefined,
        )
        .filter((label): label is string => Boolean(label));
      return labels.length ? labels.join(", ") : null;
    }

    case "seen":
      return null;
  }
}

/**
 * `wa.me` sem número: abre o WhatsApp com o texto pronto e deixa o adolescente
 * escolher para quem manda.
 */
function whatsappLink(
  game: PlayableGame,
  nickname: string | null,
  recap: { step: PlayableStep; text: string }[],
): string {
  const lines = [
    `*${game.title}*`,
    nickname ? `Respostas de ${nickname}:` : "Minhas respostas:",
    "",
    ...recap.map(({ step, text }) => `• ${stepHeadline(step.data)}\n${text}`),
  ];
  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}
