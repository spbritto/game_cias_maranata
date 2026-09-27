"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { FileText, Loader2, Plus, Sparkles, Upload } from "lucide-react";
import { Button, Card } from "./ui";
import {
  criarJogoAction,
  gerarAulaComIaAction,
  type GerarAulaState,
} from "@/app/(professor)/actions";

/** Mesmo teto da action; checar aqui evita subir 4 MB só para ouvir "não". */
const MAX_PDF_BYTES = 4 * 1024 * 1024 - 64 * 1024;

/**
 * Mensagens da espera. A geração leva de 20 a 60s, e uma tela parada nesse
 * tempo parece travada — o professor tenta de novo e gera duas aulas.
 */
const WAITING_STEPS = [
  "Lendo o PDF da aula…",
  "Encontrando as situações do cotidiano…",
  "Montando as missões…",
  "Escrevendo as reflexões de cada alternativa…",
  "Conferindo os versículos com o texto da aula…",
  "Quase lá…",
];

export function NovaAula() {
  return (
    <div className="flex flex-col gap-4">
      <PdfCard />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-ink">Começar em branco</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Monte as missões uma a uma, sem material de apoio.
          </p>
        </div>
        <form action={criarJogoAction}>
          <Button type="submit">
            <Plus aria-hidden className="size-4" />
            Aula em branco
          </Button>
        </form>
      </Card>
    </div>
  );
}

function PdfCard() {
  const [state, formAction, pending] = useActionState<GerarAulaState, FormData>(
    gerarAulaComIaAction,
    { error: null },
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = localError ?? state.error;

  return (
    <Card className="border-ember-500/40 bg-ember-500/[0.05]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ember-500/30 bg-ember-500/10 text-ember-400">
          <Sparkles aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-ink">
            Criar a partir do PDF da aula
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Envie a aula escrita e a IA monta as missões, as reflexões e a
            conclusão usando os versículos do próprio material. Você revisa
            tudo antes de publicar.
          </p>
        </div>
      </div>

      {/*
        Envio manual (onSubmit + transition) em vez de `action={...}`: com
        `action`, o React 19 limpa o formulário depois da resposta, e após um
        erro da IA o professor teria de escolher o arquivo de novo para tentar.
      */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pending) return;
          const file = inputRef.current?.files?.[0];
          if (!file) {
            setLocalError("Escolha o PDF da aula.");
            return;
          }
          if (file.size > MAX_PDF_BYTES) {
            setLocalError(
              "Esse PDF passa de 4 MB. A aula escrita costuma ter bem menos — confira se é o arquivo certo.",
            );
            return;
          }
          setLocalError(null);
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="mt-5 flex flex-col gap-4"
      >
        <label className="flex min-h-touch cursor-pointer items-center gap-3 rounded-field border border-dashed border-line-strong bg-surface-raised px-4 py-4 text-sm text-ink-muted hover:border-ember-500/60">
          {fileName ? (
            <FileText aria-hidden className="size-5 shrink-0 text-ember-400" />
          ) : (
            <Upload aria-hidden className="size-5 shrink-0" />
          )}
          <span className="min-w-0 truncate">
            {fileName ?? "Escolher o PDF da aula escrita"}
          </span>
          <input
            ref={inputRef}
            type="file"
            name="pdf"
            accept="application/pdf,.pdf"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              setLocalError(null);
              setFileName(e.target.files?.[0]?.name ?? null);
            }}
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-field border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}

        <GenerateButton pending={pending} />
      </form>
    </Card>
  );
}

function GenerateButton({ pending }: { pending: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(
      () => setStep((current) => Math.min(current + 1, WAITING_STEPS.length - 1)),
      8000,
    );
    return () => {
      window.clearInterval(timer);
      setStep(0);
    };
  }, [pending]);

  return (
    <div className="flex flex-col gap-2">
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <Sparkles aria-hidden className="size-4" />
        )}
        {pending ? "Gerando a aula…" : "Gerar aula"}
      </Button>
      {pending ? (
        <p aria-live="polite" className="text-center text-sm text-ink-muted">
          {WAITING_STEPS[step]}{" "}
          <span className="text-ink-subtle">Leva até um minuto.</span>
        </p>
      ) : null}
    </div>
  );
}
