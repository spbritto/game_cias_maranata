"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { ScriptureCard } from "./scripture-card";
import type { PlayableStep } from "@/lib/game";
import type { PlayerAnswer } from "@/lib/player-progress";
import type { RichOption } from "@/lib/schemas/step";
import { cn } from "@/lib/utils";

type StepViewProps = {
  step: PlayableStep;
  answer: PlayerAnswer | undefined;
  /** true depois que o adolescente respondeu: a reflexão está à mostra. */
  revealed: boolean;
  onAnswer: (answer: PlayerAnswer) => void;
  onAdvance: () => void;
  isLast: boolean;
};

/**
 * Renderiza uma etapa e conduz o ciclo responder → revelar → avançar.
 *
 * O componente guarda rascunho local (texto digitado, chips marcados), então o
 * pai precisa passar `key={step.id}` para o estado zerar a cada etapa.
 */
export function StepView({
  step,
  answer,
  revealed,
  onAnswer,
  onAdvance,
  isLast,
}: StepViewProps) {
  const { data } = step;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        {data.title ? (
          <p className="text-sm font-semibold tracking-[0.18em] text-ember-400 uppercase">
            {data.title}
          </p>
        ) : null}

        {data.context ? (
          <p className="leading-relaxed text-ink-muted">{data.context}</p>
        ) : null}

        <h1 className="text-2xl leading-snug font-semibold text-ink">
          {data.type === "true_false"
            ? data.statement
            : data.type === "verse"
              ? data.scriptureRef
              : data.question}
        </h1>
      </header>

      {renderInteraction({ step, answer, revealed, onAnswer })}

      <AnimatePresence>
        {revealed ? (
          <Reveal key="reveal">
            {renderReveal({ step, answer })}
            <AdvanceButton onClick={onAdvance} isLast={isLast} />
          </Reveal>
        ) : null}
      </AnimatePresence>

      {/* `verse` não tem o que responder: avança direto. */}
      {data.type === "verse" ? (
        <AdvanceButton onClick={onAdvance} isLast={isLast} />
      ) : null}
    </div>
  );
}

// --- área de interação ----------------------------------------------------

function renderInteraction({
  step,
  answer,
  revealed,
  onAnswer,
}: Pick<StepViewProps, "step" | "answer" | "revealed" | "onAnswer">) {
  const { data } = step;

  switch (data.type) {
    case "choice":
    case "scenario": {
      const chosen = answer?.kind === "option" ? answer.optionIds[0] : undefined;
      // `scenario` nunca tem resposta esperada; `choice` pode ter.
      const correctId = data.type === "choice" ? data.correctOptionId : undefined;

      return (
        <ul className="flex flex-col gap-3">
          {data.options.map((option) => (
            <li key={option.id}>
              <OptionButton
                label={option.label}
                selected={chosen === option.id}
                locked={revealed}
                /* Só destaca depois de responder, e só com acento — nunca com
                   verde/vermelho: a seção 17 proíbe feedback que julgue. */
                highlighted={revealed && correctId === option.id}
                onClick={() =>
                  onAnswer({ kind: "option", optionIds: [option.id] })
                }
              />
            </li>
          ))}
        </ul>
      );
    }

    case "true_false": {
      const chosen = answer?.kind === "boolean" ? answer.value : undefined;
      return (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((value) => (
            <OptionButton
              key={String(value)}
              label={value ? "Verdadeiro" : "Falso"}
              selected={chosen === value}
              locked={revealed}
              highlighted={revealed && data.answer === value}
              centered
              onClick={() => onAnswer({ kind: "boolean", value })}
            />
          ))}
        </div>
      );
    }

    case "reflection":
      return (
        <ReflectionPicker
          options={data.options}
          allowMultiple={data.allowMultiple}
          locked={revealed}
          selected={answer?.kind === "option" ? answer.optionIds : []}
          onConfirm={(optionIds) => onAnswer({ kind: "option", optionIds })}
        />
      );

    case "open_question":
      return (
        <OpenAnswer
          placeholder={data.placeholder}
          maxLength={data.maxLength}
          locked={revealed}
          value={answer?.kind === "text" ? answer.value : ""}
          onConfirm={(value) => onAnswer({ kind: "text", value })}
        />
      );

    case "verse":
      return (
        <div className="flex flex-col gap-5">
          <ScriptureCard
            reference={data.scriptureRef}
            text={data.scriptureText}
          />
          {data.comment ? (
            <p className="leading-relaxed text-ink-muted">{data.comment}</p>
          ) : null}
        </div>
      );
  }
}

// --- conteúdo revelado ----------------------------------------------------

function renderReveal({ step, answer }: Pick<StepViewProps, "step" | "answer">) {
  const { data } = step;

  /** Reflexão presa à alternativa escolhida — o que faz o feedback ensinar. */
  let chosenOption: RichOption | undefined;
  if (
    (data.type === "choice" || data.type === "scenario") &&
    answer?.kind === "option"
  ) {
    chosenOption = data.options.find((o) => o.id === answer.optionIds[0]);
  }

  return (
    <>
      <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-ember-400 uppercase">
        <Sparkles aria-hidden className="size-4" />
        Reflexão
      </p>

      {data.type === "true_false" ? (
        <p className="font-medium text-ink">
          A afirmação é {data.answer ? "verdadeira" : "falsa"}.
        </p>
      ) : null}

      {chosenOption?.reflection ? (
        <p className="leading-relaxed text-ink">{chosenOption.reflection}</p>
      ) : null}

      {chosenOption?.scriptureRef ? (
        <ScriptureCard
          reference={chosenOption.scriptureRef}
          text={chosenOption.scriptureText}
        />
      ) : null}

      {data.type === "true_false" && data.explanation ? (
        <p className="leading-relaxed text-ink">{data.explanation}</p>
      ) : null}

      {data.reflection ? (
        <p className="leading-relaxed text-ink-muted">{data.reflection}</p>
      ) : null}

      {data.scriptureRef ? (
        <ScriptureCard
          reference={data.scriptureRef}
          text={data.scriptureText}
        />
      ) : null}
    </>
  );
}

// --- peças ----------------------------------------------------------------

function OptionButton({
  label,
  selected,
  locked,
  highlighted,
  centered,
  onClick,
}: {
  label: string;
  selected: boolean;
  locked: boolean;
  highlighted: boolean;
  centered?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      aria-pressed={selected}
      className={cn(
        "flex min-h-touch w-full items-center gap-3 rounded-card border p-4 text-left leading-snug transition-colors",
        centered && "justify-center text-center",
        selected
          ? "border-aurora-400 bg-aurora-500/15 text-ink"
          : "border-line bg-surface-raised text-ink-muted",
        highlighted && "border-ember-500 bg-ember-500/10 text-ink",
        !locked && "hover:border-line-strong hover:bg-surface-overlay",
        locked && "cursor-default",
      )}
    >
      {highlighted ? (
        <Check aria-hidden className="size-5 shrink-0 text-ember-400" />
      ) : null}
      <span>{label}</span>
    </button>
  );
}

function ReflectionPicker({
  options,
  allowMultiple,
  locked,
  selected,
  onConfirm,
}: {
  options: { id: string; label: string }[];
  allowMultiple: boolean;
  locked: boolean;
  selected: string[];
  onConfirm: (optionIds: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(selected);

  function toggle(id: string) {
    setDraft((current) => {
      if (!allowMultiple) return [id];
      return current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = draft.includes(option.id);
          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={locked}
                aria-pressed={on}
                onClick={() => toggle(option.id)}
                className={cn(
                  "min-h-touch rounded-pill border px-5 text-sm font-medium transition-colors",
                  on
                    ? "border-aurora-400 bg-aurora-500/20 text-ink"
                    : "border-line bg-surface-raised text-ink-muted",
                  !locked && "hover:border-line-strong",
                )}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>

      {!locked ? (
        <PrimaryButton
          disabled={draft.length === 0}
          onClick={() => onConfirm(draft)}
        >
          Continuar
        </PrimaryButton>
      ) : null}
    </div>
  );
}

function OpenAnswer({
  placeholder,
  maxLength,
  locked,
  value,
  onConfirm,
}: {
  placeholder?: string;
  maxLength: number;
  locked: boolean;
  value: string;
  onConfirm: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={locked}
        maxLength={maxLength}
        rows={5}
        placeholder={placeholder}
        /* text-base evita o zoom automático do iOS ao focar o campo. */
        className="w-full resize-none rounded-card border border-line bg-surface-raised p-4 text-base leading-relaxed text-ink placeholder:text-ink-subtle disabled:cursor-default"
      />
      <p className="text-right text-xs tabular-nums text-ink-subtle">
        {draft.length}/{maxLength}
      </p>

      {!locked ? (
        /* Sem exigir texto: obrigar um adolescente a escrever para poder
           avançar é o tipo de barreira que faz ele largar o jogo. */
        <PrimaryButton onClick={() => onConfirm(draft.trim())}>
          Continuar
        </PrimaryButton>
      ) : null}
    </div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 border-t border-line pt-6"
    >
      {children}
    </motion.section>
  );
}

function AdvanceButton({
  onClick,
  isLast,
}: {
  onClick: () => void;
  isLast: boolean;
}) {
  return (
    <PrimaryButton onClick={onClick}>
      {isLast ? "Concluir missão" : "Próxima missão"}
      <ArrowRight aria-hidden className="size-5" />
    </PrimaryButton>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-touch w-full items-center justify-center gap-2 rounded-pill bg-accent px-6 text-base font-semibold text-night-950 transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-night-700 disabled:text-ink-subtle"
    >
      {children}
    </button>
  );
}
