"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Cloud,
  CloudOff,
  Eye,
  Loader2,
  Plus,
  Rocket,
} from "lucide-react";
import { StepList, type EditorStep } from "./step-list";
import { Button, Card, Field, Select, StatusBadge, TextArea, TextInput } from "./ui";
import { useAutosave } from "./use-autosave";
import { ShareCard } from "./share-card";
import {
  publicarJogoAction,
  salvarJogoAction,
  type PublishResult,
} from "@/app/(professor)/actions";
import type { GameDraftRecord } from "@/db/queries/teacher-games";
import { STEP_TYPES, STEP_TYPE_HINTS, STEP_TYPE_LABELS } from "@/lib/schemas/step";
import {
  blankConclusion,
  blankStep,
  type ConclusionDraft,
} from "@/lib/schemas/step-draft";
import type { StepType } from "@/lib/schemas/step";

type Info = GameDraftRecord["info"];

/**
 * Editor completo de uma aula.
 *
 * Todo o rascunho vive num estado só, que o autosave observa inteiro. É por
 * isso que não há react-hook-form aqui: com salvamento automático o estado
 * precisa estar levantado de qualquer jeito, e uma segunda fonte de verdade
 * só criaria divergência.
 */
export function GameEditor({ record }: { record: GameDraftRecord }) {
  const [info, setInfo] = useState<Info>(record.info);
  const [steps, setSteps] = useState<EditorStep[]>(record.steps);
  const [conclusion, setConclusion] = useState<ConclusionDraft>(
    record.conclusion ?? blankConclusion(),
  );
  const [status, setStatus] = useState(record.status);
  const [slug, setSlug] = useState(record.slug);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishing, startPublishing] = useTransition();

  const draft = useMemo(
    () => ({ info, steps: steps.map((s) => ({ id: s.id, data: s.data })), conclusion }),
    [info, steps, conclusion],
  );

  const save = useCallback(
    (value: typeof draft) => salvarJogoAction(record.id, value),
    [record.id],
  );
  const { status: saveStatus, error: saveError } = useAutosave(draft, save);

  function addStep(type: StepType) {
    setSteps((current) => [
      ...current,
      // O id nasce aqui e nunca muda: é a chave do progresso guardado no
      // celular do adolescente. Gerar no servidor quebraria quem já jogou.
      { id: crypto.randomUUID(), data: blankStep(type) },
    ]);
  }

  function publish() {
    startPublishing(async () => {
      const result = await publicarJogoAction(record.id, draft);
      setPublishResult(result);
      if (result.ok && result.slug) {
        setSlug(result.slug);
        setStatus("published");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/painel"
            className="inline-flex min-h-touch items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Painel
          </Link>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <StatusBadge status={status} />
          </div>
        </div>

        {saveError ? (
          <p
            role="alert"
            className="rounded-field border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {saveError}
          </p>
        ) : null}
      </header>

      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-2xl font-semibold text-ink">A aula</h1>

        <Field label="Título do jogo">
          {(id) => (
            <TextInput
              id={id}
              value={info.title}
              onChange={(e) => setInfo({ ...info, title: e.target.value })}
              placeholder="Missão: Descubra o Propósito"
            />
          )}
        </Field>

        <Field label="Tema" hint="Vira a base do endereço do link.">
          {(id) => (
            <TextInput
              id={id}
              value={info.theme}
              onChange={(e) => setInfo({ ...info, theme: e.target.value })}
              placeholder="Propósito"
            />
          )}
        </Field>

        <Field
          label="Objetivo da aula"
          hint="Para você. Não aparece para o adolescente."
        >
          {(id) => (
            <TextArea
              id={id}
              rows={3}
              value={info.objective}
              onChange={(e) => setInfo({ ...info, objective: e.target.value })}
            />
          )}
        </Field>

        <Field label="Texto bíblico principal">
          {(id) => (
            <TextInput
              id={id}
              value={info.mainScripture}
              onChange={(e) =>
                setInfo({ ...info, mainScripture: e.target.value })
              }
              placeholder="Efésios 2:10"
            />
          )}
        </Field>

        <Field
          label="Apresentação"
          hint="Esta sim aparece, na tela de abertura do jogo."
        >
          {(id) => (
            <TextArea
              id={id}
              rows={3}
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
            />
          )}
        </Field>
      </section>

      <section className="mt-10 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-ink">
            Missões{" "}
            <span className="text-base font-normal text-ink-subtle">
              ({steps.length})
            </span>
          </h2>
        </div>

        {steps.length ? (
          <StepList
            steps={steps}
            onChange={setSteps}
            onRemove={(id) =>
              setSteps((current) => current.filter((s) => s.id !== id))
            }
          />
        ) : (
          <Card className="border-dashed text-center">
            <p className="text-sm leading-relaxed text-ink-muted">
              Ainda não há missões. Comece por uma situação do cotidiano dos
              adolescentes — o princípio bíblico entra depois, como resposta.
            </p>
          </Card>
        )}

        <AddStep onAdd={addStep} disabled={steps.length >= 30} />
      </section>

      <section className="mt-10 flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Conclusão</h2>
          <p className="mt-1 text-sm text-ink-subtle">
            A tela de fechamento, depois da última missão.
          </p>
        </div>

        <Field label="Título">
          {(id) => (
            <TextInput
              id={id}
              value={conclusion.title}
              onChange={(e) =>
                setConclusion({ ...conclusion, title: e.target.value })
              }
            />
          )}
        </Field>

        <Field label="Mensagem de fechamento">
          {(id) => (
            <TextArea
              id={id}
              rows={4}
              value={conclusion.message}
              onChange={(e) =>
                setConclusion({ ...conclusion, message: e.target.value })
              }
            />
          )}
        </Field>

        <Field
          label="Caminho visual"
          hint="Palavras separadas por vírgula, mostradas em cascata. Ex.: Criador, Identidade, Propósito, Vida"
        >
          {(id) => (
            <TextInput
              id={id}
              value={conclusion.diagram.join(", ")}
              onChange={(e) =>
                setConclusion({
                  ...conclusion,
                  diagram: e.target.value
                    .split(",")
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .slice(0, 6),
                })
              }
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Field label="Referência bíblica">
            {(id) => (
              <TextInput
                id={id}
                value={conclusion.scriptureRef}
                onChange={(e) =>
                  setConclusion({ ...conclusion, scriptureRef: e.target.value })
                }
              />
            )}
          </Field>
          <Field label="Texto do versículo">
            {(id) => (
              <TextArea
                id={id}
                rows={2}
                value={conclusion.scriptureText}
                onChange={(e) =>
                  setConclusion({ ...conclusion, scriptureText: e.target.value })
                }
              />
            )}
          </Field>
        </div>

        <Field
          label="Pergunta para a discussão final"
          hint="Aparece para o adolescente no fim, e é por onde você retoma a conversa."
        >
          {(id) => (
            <TextArea
              id={id}
              rows={2}
              value={conclusion.discussionQuestion}
              onChange={(e) =>
                setConclusion({
                  ...conclusion,
                  discussionQuestion: e.target.value,
                })
              }
            />
          )}
        </Field>
      </section>

      <section className="mt-10 flex flex-col gap-4 border-t border-line pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/jogos/${record.id}/previa`}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-5 text-sm font-semibold text-ink hover:border-line-strong"
          >
            <Eye aria-hidden className="size-4" />
            Ver como fica
          </Link>

          <Button variant="primary" onClick={publish} disabled={publishing}>
            {publishing ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Rocket aria-hidden className="size-4" />
            )}
            {status === "draft" ? "Publicar" : "Republicar"}
          </Button>
        </div>

        {publishResult?.problems?.length ? (
          <Card className="border-ember-500/40 bg-ember-500/[0.06]">
            <p className="flex items-center gap-2 text-sm font-semibold text-ember-300">
              <AlertTriangle aria-hidden className="size-4" />
              Falta pouco para publicar
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-muted">
              {publishResult.problems.map((problem, i) => (
                <li key={i}>
                  {problem.step ? (
                    <strong className="text-ink">
                      Missão {problem.step}:{" "}
                    </strong>
                  ) : null}
                  {problem.message}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {slug && status !== "draft" ? <ShareCard slug={slug} /> : null}
      </section>
    </main>
  );
}

function AddStep({
  onAdd,
  disabled,
}: {
  onAdd: (type: StepType) => void;
  disabled: boolean;
}) {
  const [type, setType] = useState<StepType>("choice");

  return (
    <Card className="flex flex-col gap-3">
      <Field label="Adicionar missão" hint={STEP_TYPE_HINTS[type]}>
        {(id) => (
          <Select
            id={id}
            value={type}
            onChange={(e) => setType(e.target.value as StepType)}
          >
            {STEP_TYPES.map((value) => (
              <option key={value} value={value}>
                {STEP_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Button onClick={() => onAdd(type)} disabled={disabled}>
        <Plus aria-hidden className="size-4" />
        Adicionar
      </Button>
    </Card>
  );
}

function SaveIndicator({
  status,
}: {
  status: "saved" | "dirty" | "saving" | "error";
}) {
  const map = {
    saved: { icon: Check, text: "Salvo", className: "text-ink-subtle" },
    dirty: { icon: Cloud, text: "Alterações pendentes", className: "text-ink-subtle" },
    saving: { icon: Loader2, text: "Salvando...", className: "text-ink-muted" },
    error: { icon: CloudOff, text: "Não salvou", className: "text-red-300" },
  } as const;

  const { icon: Icon, text, className } = map[status];

  return (
    <span
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs ${className}`}
    >
      <Icon
        aria-hidden
        className={`size-3.5 ${status === "saving" ? "animate-spin" : ""}`}
      />
      {text}
    </span>
  );
}
