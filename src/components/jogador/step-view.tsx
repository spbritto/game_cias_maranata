"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Heart,
  MessagesSquare,
  PenLine,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { drawLine, rise, staggerGroup, tap } from "./motion-presets";
import { ScriptureCard } from "./scripture-card";
import type { PlayableStep } from "@/lib/game";
import type { PlayerAnswer } from "@/lib/player-progress";
import type { RichOption, StepType } from "@/lib/schemas/step";
import { cn } from "@/lib/utils";

type StepViewProps = {
  step: PlayableStep;
  /** Posição na jornada, base um — vira o "Missão 02" do selo. */
  number: number;
  answer: PlayerAnswer | undefined;
  /** true depois que o adolescente respondeu: a reflexão está à mostra. */
  revealed: boolean;
  onAnswer: (answer: PlayerAnswer) => void;
  onAdvance: () => void;
  isLast: boolean;
};

/** Cada tipo de missão tem um símbolo — o adolescente aprende a ler a tela pelo selo. */
const STEP_ICONS: Record<StepType, LucideIcon> = {
  choice: Compass,
  scenario: MessagesSquare,
  true_false: Scale,
  reflection: Heart,
  verse: BookOpen,
  open_question: PenLine,
};

/**
 * Renderiza uma etapa e conduz o ciclo responder → revelar → avançar.
 *
 * O componente guarda rascunho local (texto digitado, chips marcados), então o
 * pai precisa passar `key={step.id}` para o estado zerar a cada etapa.
 */
export function StepView({
  step,
  number,
  answer,
  revealed,
  onAnswer,
  onAdvance,
  isLast,
}: StepViewProps) {
  const reduced = useReducedMotion();
  const { data } = step;
  const Icon = STEP_ICONS[data.type];

  const headline =
    data.type === "true_false"
      ? data.statement
      : data.type === "verse"
        ? data.scriptureRef
        : data.question;

  return (
    <motion.div
      variants={staggerGroup(reduced)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <motion.header
        variants={staggerGroup(reduced)}
        className="flex flex-col gap-4"
      >
        <Item className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ember-500/30 bg-ember-500/10 text-ember-400">
            <Icon aria-hidden className="size-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.2em] text-ember-400 uppercase">
              Missão {String(number).padStart(2, "0")}
            </span>
            {data.title ? (
              <span className="text-sm text-ink-muted">{data.title}</span>
            ) : null}
          </div>
        </Item>

        {data.context ? (
          <Item>
            <p className="leading-relaxed text-ink-muted">{data.context}</p>
          </Item>
        ) : null}

        <Item>
          <h1 className="text-2xl leading-snug font-semibold text-ink">
            {headline}
          </h1>
        </Item>
      </motion.header>

      <Interaction
        step={step}
        answer={answer}
        revealed={revealed}
        onAnswer={onAnswer}
      />

      <AnimatePresence>
        {revealed ? (
          <Reveal key="reveal">
            <RevealContent step={step} answer={answer} />
            <Item>
              <AdvanceButton onClick={onAdvance} isLast={isLast} />
            </Item>
          </Reveal>
        ) : null}
      </AnimatePresence>

      {/* `verse` não tem o que responder: avança direto. */}
      {data.type === "verse" ? (
        <Item>
          <AdvanceButton onClick={onAdvance} isLast={isLast} />
        </Item>
      ) : null}
    </motion.div>
  );
}

// --- área de interação ----------------------------------------------------

function Interaction({
  step,
  answer,
  revealed,
  onAnswer,
}: Pick<StepViewProps, "step" | "answer" | "revealed" | "onAnswer">) {
  const reduced = useReducedMotion();
  const { data } = step;

  switch (data.type) {
    case "choice":
    case "scenario": {
      const chosen = answer?.kind === "option" ? answer.optionIds[0] : undefined;
      // `scenario` nunca tem resposta esperada; `choice` pode ter.
      const correctId = data.type === "choice" ? data.correctOptionId : undefined;

      return (
        <motion.ul
          variants={staggerGroup(reduced, 0.05)}
          className="flex flex-col gap-3"
        >
          {data.options.map((option, i) => (
            <Item as="li" key={option.id}>
              <OptionButton
                marker={String.fromCharCode(65 + i)}
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
            </Item>
          ))}
        </motion.ul>
      );
    }

    case "true_false": {
      const chosen = answer?.kind === "boolean" ? answer.value : undefined;
      return (
        <motion.div
          variants={staggerGroup(reduced, 0.08)}
          className="grid grid-cols-2 gap-3"
        >
          {[true, false].map((value) => (
            <Item key={String(value)}>
              <OptionButton
                label={value ? "Verdadeiro" : "Falso"}
                selected={chosen === value}
                locked={revealed}
                highlighted={revealed && data.answer === value}
                centered
                onClick={() => onAnswer({ kind: "boolean", value })}
              />
            </Item>
          ))}
        </motion.div>
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
        <motion.div
          variants={staggerGroup(reduced)}
          className="flex flex-col gap-5"
        >
          <Item>
            <ScriptureCard
              reference={data.scriptureRef}
              text={data.scriptureText}
              glow
            />
          </Item>
          {data.comment ? (
            <Item>
              <p className="leading-relaxed text-ink-muted">{data.comment}</p>
            </Item>
          ) : null}
        </motion.div>
      );
  }
}

// --- conteúdo revelado ----------------------------------------------------

function RevealContent({ step, answer }: Pick<StepViewProps, "step" | "answer">) {
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
      <Item>
        <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-ember-400 uppercase">
          <Sparkles aria-hidden className="size-4" />
          Reflexão
        </p>
      </Item>

      {data.type === "true_false" ? (
        <Item>
          <p className="font-medium text-ink">
            A afirmação é {data.answer ? "verdadeira" : "falsa"}.
          </p>
        </Item>
      ) : null}

      {chosenOption?.reflection ? (
        <Item>
          <p className="leading-relaxed text-ink">{chosenOption.reflection}</p>
        </Item>
      ) : null}

      {chosenOption?.scriptureRef ? (
        <Item>
          <ScriptureCard
            reference={chosenOption.scriptureRef}
            text={chosenOption.scriptureText}
            glow
          />
        </Item>
      ) : null}

      {data.type === "true_false" && data.explanation ? (
        <Item>
          <p className="leading-relaxed text-ink">{data.explanation}</p>
        </Item>
      ) : null}

      {data.reflection ? (
        <Item>
          <p className="leading-relaxed text-ink-muted">{data.reflection}</p>
        </Item>
      ) : null}

      {data.scriptureRef ? (
        <Item>
          <ScriptureCard
            reference={data.scriptureRef}
            text={data.scriptureText}
            glow
          />
        </Item>
      ) : null}
    </>
  );
}

// --- peças ----------------------------------------------------------------

/** Filho de um grupo escalonado: sobe e aparece na vez dele. */
function Item({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag variants={rise(reduced)} className={className}>
      {children}
    </Tag>
  );
}

function OptionButton({
  marker,
  label,
  selected,
  locked,
  highlighted,
  centered,
  onClick,
}: {
  marker?: string;
  label: string;
  selected: boolean;
  locked: boolean;
  highlighted: boolean;
  centered?: boolean;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  // Depois de responder, o que não foi escolhido nem destacado sai de cena.
  const dimmed = locked && !selected && !highlighted;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={locked}
      aria-pressed={selected}
      initial={false}
      animate={{ opacity: dimmed ? 0.4 : 1 }}
      whileTap={locked ? undefined : tap(reduced)}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex min-h-touch w-full items-center gap-3 rounded-card border p-4 text-left leading-snug transition-colors",
        centered && "justify-center text-center",
        selected
          ? "border-aurora-400 bg-aurora-500/15 text-ink"
          : "border-line bg-surface-raised text-ink-muted",
        highlighted && "glow-ember border-ember-500 bg-ember-500/10 text-ink",
        !locked && "hover:border-line-strong hover:bg-surface-overlay",
        locked && "cursor-default",
      )}
    >
      {highlighted ? (
        <Check aria-hidden className="size-5 shrink-0 text-ember-400" />
      ) : marker ? (
        <span
          aria-hidden
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
            selected
              ? "border-aurora-400 text-aurora-400"
              : "border-line-strong text-ink-subtle",
          )}
        >
          {marker}
        </span>
      ) : null}
      <span>{label}</span>
    </motion.button>
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
  const reduced = useReducedMotion();
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
    <motion.div
      variants={staggerGroup(reduced)}
      className="flex flex-col gap-5"
    >
      <motion.ul
        variants={staggerGroup(reduced, 0.04)}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const on = draft.includes(option.id);
          return (
            <Item as="li" key={option.id}>
              <motion.button
                type="button"
                disabled={locked}
                aria-pressed={on}
                onClick={() => toggle(option.id)}
                initial={false}
                animate={{
                  scale: on && !reduced ? 1.04 : 1,
                  opacity: locked && !on ? 0.4 : 1,
                }}
                whileTap={locked ? undefined : tap(reduced)}
                className={cn(
                  "min-h-touch rounded-pill border px-5 text-sm font-medium transition-colors",
                  on
                    ? "border-aurora-400 bg-aurora-500/20 text-ink"
                    : "border-line bg-surface-raised text-ink-muted",
                  !locked && "hover:border-line-strong",
                )}
              >
                {option.label}
              </motion.button>
            </Item>
          );
        })}
      </motion.ul>

      {!locked ? (
        <Item>
          <PrimaryButton
            disabled={draft.length === 0}
            onClick={() => onConfirm(draft)}
          >
            Continuar
          </PrimaryButton>
        </Item>
      ) : null}
    </motion.div>
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
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState(value);

  return (
    <motion.div
      variants={staggerGroup(reduced)}
      className="flex flex-col gap-4"
    >
      <Item>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={locked}
          maxLength={maxLength}
          rows={5}
          placeholder={placeholder}
          /* text-base evita o zoom automático do iOS ao focar o campo. */
          className="w-full resize-none rounded-card border border-line bg-surface-raised p-4 text-base leading-relaxed text-ink transition-colors placeholder:text-ink-subtle focus:border-aurora-400 disabled:cursor-default"
        />
        <p className="mt-2 text-right text-xs tabular-nums text-ink-subtle">
          {draft.length}/{maxLength}
        </p>
      </Item>

      {!locked ? (
        /* Sem exigir texto: obrigar um adolescente a escrever para poder
           avançar é o tipo de barreira que faz ele largar o jogo. */
        <Item>
          <PrimaryButton onClick={() => onConfirm(draft.trim())}>
            Continuar
          </PrimaryButton>
        </Item>
      ) : null}
    </motion.div>
  );
}

/**
 * Painel da reflexão. Uma linha se desenha primeiro, depois o conteúdo entra
 * escalonado — é o instante central da jornada, e o ritmo é para ser sentido.
 */
function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      variants={staggerGroup(reduced, 0.09)}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="flex flex-col gap-4 pt-2"
    >
      <motion.div
        variants={drawLine(reduced)}
        style={{ originX: 0 }}
        className="h-px bg-gradient-to-r from-ember-500/80 via-ember-500/30 to-transparent"
      />
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
  breathe,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  /** Brilho lento e contínuo — só para a chamada principal da tela inicial. */
  breathe?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : tap(reduced)}
      className={cn(
        "flex min-h-touch w-full items-center justify-center gap-2 rounded-pill bg-accent px-6 text-base font-semibold text-night-950 transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-night-700 disabled:text-ink-subtle",
        breathe && !disabled && "cta-breathe",
      )}
    >
      {children}
    </motion.button>
  );
}
