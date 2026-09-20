"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, MessageCircle, RotateCcw } from "lucide-react";
import { growDown, pop, rise, staggerGroup, tap } from "./motion-presets";
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
  const reduced = useReducedMotion();
  const item = rise(reduced);
  const conclusion = game.conclusion;
  const recap = game.steps
    .map((step) => ({ step, text: describeAnswer(step, answers[step.id]) }))
    .filter((row): row is { step: PlayableStep; text: string } =>
      Boolean(row.text),
    );

  return (
    <motion.div
      variants={staggerGroup(reduced, 0.1)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 py-12"
    >
      <motion.header
        variants={staggerGroup(reduced, 0.1)}
        className="flex flex-col gap-4"
      >
        {/* selo de conclusão: a única "conquista" da jornada, e ela é de
            chegada, não de pontuação */}
        <motion.span
          variants={pop(reduced)}
          className="glow-ember flex size-16 items-center justify-center rounded-full border border-ember-500/40 bg-ember-500/15 text-ember-400"
        >
          <Check aria-hidden className="size-8" strokeWidth={2.5} />
        </motion.span>

        <motion.p
          variants={item}
          className="text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase"
        >
          {nickname ? `Boa, ${nickname}` : "Chegou ao fim"}
        </motion.p>

        <motion.h1
          variants={item}
          className="text-3xl leading-tight font-semibold text-ink"
        >
          {conclusion?.title ?? "Missão concluída"}
        </motion.h1>

        {conclusion?.message ? (
          <motion.p
            variants={item}
            className="text-lg leading-relaxed text-ink-muted"
          >
            {conclusion.message}
          </motion.p>
        ) : null}
      </motion.header>

      {conclusion?.diagram?.length ? (
        <motion.ol
          variants={staggerGroup(reduced, 0.12)}
          className="flex flex-col items-center"
        >
          {conclusion.diagram.map((node, i) => (
            <li key={node} className="flex flex-col items-center">
              {i > 0 ? (
                <motion.span
                  aria-hidden
                  variants={growDown(reduced)}
                  style={{ originY: 0 }}
                  className="h-6 w-px bg-ember-500/50"
                />
              ) : null}
              <motion.span
                variants={pop(reduced)}
                className="rounded-pill border border-ember-500/30 bg-ember-500/[0.07] px-5 py-2 text-sm font-semibold tracking-[0.12em] text-ember-300 uppercase"
              >
                {node}
              </motion.span>
            </li>
          ))}
        </motion.ol>
      ) : null}

      {conclusion?.scriptureRef ? (
        <motion.div variants={item}>
          <ScriptureCard
            reference={conclusion.scriptureRef}
            text={conclusion.scriptureText}
            glow
          />
        </motion.div>
      ) : null}

      {conclusion?.discussionQuestion ? (
        <motion.section
          variants={item}
          className="rounded-card border border-aurora-500/30 bg-aurora-500/[0.08] p-5"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-aurora-400 uppercase">
            Para conversar na aula
          </p>
          <p className="mt-2 leading-relaxed text-ink">
            {conclusion.discussionQuestion}
          </p>
        </motion.section>
      ) : null}

      {recap.length ? (
        <motion.section
          variants={staggerGroup(reduced, 0.06)}
          className="flex flex-col gap-4"
        >
          <motion.h2 variants={item} className="text-lg font-semibold text-ink">
            O que você respondeu
          </motion.h2>
          <dl className="flex flex-col gap-4">
            {recap.map(({ step, text }) => (
              <motion.div
                key={step.id}
                variants={item}
                className="rounded-card border border-line bg-surface-raised p-4"
              >
                <dt className="text-sm text-ink-subtle">
                  {stepHeadline(step.data)}
                </dt>
                <dd className="mt-1 leading-relaxed text-ink">{text}</dd>
              </motion.div>
            ))}
          </dl>
        </motion.section>
      ) : null}

      <motion.div variants={item} className="flex flex-col gap-3">
        {recap.length ? (
          <motion.a
            href={whatsappLink(game, nickname, recap)}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={tap(reduced)}
            className="flex min-h-touch w-full items-center justify-center gap-2 rounded-pill bg-accent px-6 text-base font-semibold text-night-950 transition-colors hover:bg-accent-soft"
          >
            <MessageCircle aria-hidden className="size-5" />
            Mandar pro professor
          </motion.a>
        ) : null}

        <button
          type="button"
          onClick={onRestart}
          className="flex min-h-touch items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <RotateCcw aria-hidden className="size-4" />
          Jogar de novo
        </button>
      </motion.div>
    </motion.div>
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
