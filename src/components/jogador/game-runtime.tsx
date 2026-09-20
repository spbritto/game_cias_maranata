"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ConclusionScreen } from "./conclusion-screen";
import { EASE_OUT } from "./motion-presets";
import { ProgressTrail } from "./progress-trail";
import { Starfield } from "./starfield";
import { StartScreen } from "./start-screen";
import { StepView } from "./step-view";
import type { PlayableGame } from "@/lib/game";
import {
  BLANK_PROGRESS,
  clearProgress,
  newProgress,
  parseProgress,
  readRawProgress,
  subscribeProgress,
  writeProgress,
  type PlayerAnswer,
} from "@/lib/player-progress";

/**
 * Runtime da jornada: uma etapa por vez, avanço controlado pelo adolescente.
 *
 * Todo o estado vive no aparelho, e o `localStorage` é a fonte única de verdade
 * — não há cópia em `useState` para sair de sincronia. O componente não conhece
 * banco nem servidor: recebe um `PlayableGame` e pronto, o que permite reusá-lo
 * na prévia do professor (Fase 4) sem duplicar a experiência.
 */
export function GameRuntime({ game }: { game: PlayableGame }) {
  // No servidor o snapshot é null: a tela inicial sai renderizada do servidor e
  // a hidratação só acrescenta a opção de retomar.
  const raw = useSyncExternalStore(
    subscribeProgress,
    () => readRawProgress(game.slug),
    () => null,
  );
  const stored = useMemo(() => parseProgress(raw), [raw]);
  const progress = stored ?? BLANK_PROGRESS;

  const [started, setStarted] = useState(false);
  const revealAnchor = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const total = game.steps.length;
  const index = progress.currentIndex;
  const currentStep = index < total ? game.steps[index] : undefined;
  const finished = index >= total;
  const answer = currentStep ? progress.answers[currentStep.id] : undefined;
  /* Derivado, não estado: retomar no meio de uma etapa já respondida volta com
     a reflexão aberta, sem nenhuma sincronização extra. */
  const revealed = Boolean(answer);

  // Nova etapa: volta ao topo. Sem isso o adolescente cai no meio do texto.
  useEffect(() => {
    if (!started) return;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [index, started, reduced]);

  // Reflexão revelada: traz para a tela, senão ela nasce abaixo da dobra e
  // parece que o toque não fez nada. O atraso deixa a linha se desenhar antes.
  useEffect(() => {
    if (!revealed) return;
    const id = window.setTimeout(
      () =>
        revealAnchor.current?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "end",
        }),
      reduced ? 0 : 180,
    );
    return () => window.clearTimeout(id);
  }, [revealed, reduced]);

  function handleAnswer(value: PlayerAnswer) {
    if (!currentStep) return;
    writeProgress(game.slug, {
      ...progress,
      answers: { ...progress.answers, [currentStep.id]: value },
    });
  }

  function handleAdvance() {
    if (!currentStep) return;
    // Etapas de leitura (versículo) não têm resposta: registra que foi vista
    // para o retomar e o recap ficarem consistentes.
    const answers = progress.answers[currentStep.id]
      ? progress.answers
      : { ...progress.answers, [currentStep.id]: { kind: "seen" } as const };

    writeProgress(game.slug, {
      ...progress,
      answers,
      currentIndex: index + 1,
    });
  }

  function handleStart(nickname: string | null) {
    writeProgress(game.slug, newProgress(nickname));
    setStarted(true);
  }

  function handleRestart() {
    clearProgress(game.slug);
    setStarted(false);
  }

  if (!started && !finished) {
    const hasHistory =
      stored !== null &&
      (stored.currentIndex > 0 || Object.keys(stored.answers).length > 0) &&
      stored.currentIndex < total;

    return (
      <Shell>
        <StartScreen
          game={game}
          savedNickname={stored?.nickname ?? null}
          canResume={hasHistory}
          onStart={handleStart}
          onResume={() => setStarted(true)}
        />
      </Shell>
    );
  }

  if (finished || !currentStep) {
    return (
      <Shell>
        <ConclusionScreen
          game={game}
          nickname={progress.nickname}
          answers={progress.answers}
          onRestart={handleRestart}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="sticky top-0 z-10 -mx-5 bg-night-950/85 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 backdrop-blur">
        <ProgressTrail total={total} current={index} />
      </div>

      {/* A troca de etapa é só um deslize curto: a entrada escalonada de cada
          bloco acontece dentro de StepView, e duas animações competindo pelo
          mesmo elemento ficariam confusas. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={reduced ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -32 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="pt-4"
        >
          {/* key: zera o rascunho local (texto digitado, chips) a cada etapa */}
          <StepView
            key={currentStep.id}
            step={currentStep}
            number={index + 1}
            answer={answer}
            revealed={revealed}
            onAnswer={handleAnswer}
            onAdvance={handleAdvance}
            isLast={index === total - 1}
          />
        </motion.div>
      </AnimatePresence>

      <div ref={revealAnchor} aria-hidden className="h-1" />
    </Shell>
  );
}

/** Moldura comum das três telas: céu ao fundo, coluna estreita à frente. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Starfield />
      <main className="mx-auto w-full max-w-md px-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </>
  );
}
