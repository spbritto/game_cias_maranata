"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Select, TextArea, TextInput } from "./ui";
import {
  blankPlainOption,
  blankRichOption,
  type StepDraft,
} from "@/lib/schemas/step-draft";

/**
 * Campos de edição de uma etapa, por tipo.
 *
 * Só campos: a ordenação, o colapso e o cabeçalho ficam em `step-list`. Tudo
 * aqui é controlado — o estado mora no editor, que é quem o autosave observa.
 */
export function StepFields({
  draft,
  onChange,
}: {
  draft: StepDraft;
  onChange: (next: StepDraft) => void;
}) {
  /** Altera um campo mantendo o tipo estreitado da união discriminada. */
  function set<K extends keyof StepDraft>(key: K, value: StepDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label="Título da missão" hint="Aparece no selo, acima da pergunta.">
        {(id) => (
          <TextInput
            id={id}
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex.: Quem define o propósito?"
          />
        )}
      </Field>

      {draft.type !== "verse" ? (
        <Field
          label="Situação"
          hint="O cenário que antecede a pergunta. Opcional, menos em Situação do cotidiano."
        >
          {(id) => (
            <TextArea
              id={id}
              rows={3}
              value={draft.context}
              onChange={(e) => set("context", e.target.value)}
            />
          )}
        </Field>
      ) : null}

      <TypeSpecific draft={draft} onChange={onChange} />

      <Field
        label="Reflexão"
        hint="Mostrada depois que o adolescente responde."
      >
        {(id) => (
          <TextArea
            id={id}
            rows={3}
            value={draft.reflection}
            onChange={(e) => set("reflection", e.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <Field label="Referência bíblica">
          {(id) => (
            <TextInput
              id={id}
              value={draft.scriptureRef}
              onChange={(e) => set("scriptureRef", e.target.value)}
              placeholder="Efésios 2:10"
            />
          )}
        </Field>
        <Field label="Texto do versículo">
          {(id) => (
            <TextArea
              id={id}
              rows={2}
              value={draft.scriptureText}
              onChange={(e) => set("scriptureText", e.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        label="Pergunta para a conversa"
        hint="Não aparece para o adolescente — é sua, para puxar a discussão na aula."
      >
        {(id) => (
          <TextArea
            id={id}
            rows={2}
            value={draft.discussionQuestion}
            onChange={(e) => set("discussionQuestion", e.target.value)}
          />
        )}
      </Field>
    </div>
  );
}

function TypeSpecific({
  draft,
  onChange,
}: {
  draft: StepDraft;
  onChange: (next: StepDraft) => void;
}) {
  switch (draft.type) {
    case "choice":
    case "scenario":
      return (
        <>
          <Field label="Pergunta">
            {(id) => (
              <TextArea
                id={id}
                rows={2}
                value={draft.question}
                onChange={(e) => onChange({ ...draft, question: e.target.value })}
              />
            )}
          </Field>

          <RichOptions
            options={draft.options}
            onChange={(options) => onChange({ ...draft, options })}
          />

          {draft.type === "choice" ? (
            <Field
              label="Alternativa em destaque"
              hint="Opcional. A escolhida ganha um marcador âmbar na reflexão — nunca verde ou vermelho."
            >
              {(id) => (
                <Select
                  id={id}
                  value={draft.correctOptionId}
                  onChange={(e) =>
                    onChange({ ...draft, correctOptionId: e.target.value })
                  }
                >
                  <option value="">Nenhuma — só reflexão</option>
                  {draft.options.map((option, i) => (
                    <option key={option.id} value={option.id}>
                      {option.label.trim() || `Alternativa ${i + 1}`}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          ) : null}
        </>
      );

    case "true_false":
      return (
        <>
          <Field label="Afirmação">
            {(id) => (
              <TextArea
                id={id}
                rows={2}
                value={draft.statement}
                onChange={(e) =>
                  onChange({ ...draft, statement: e.target.value })
                }
                placeholder="Meu propósito é a profissão que eu vou escolher."
              />
            )}
          </Field>

          <Field label="A afirmação é">
            {(id) => (
              <Select
                id={id}
                value={draft.answer ? "true" : "false"}
                onChange={(e) =>
                  onChange({ ...draft, answer: e.target.value === "true" })
                }
              >
                <option value="true">Verdadeira</option>
                <option value="false">Falsa</option>
              </Select>
            )}
          </Field>

          <Field label="Explicação" hint="O que ensina depois da resposta.">
            {(id) => (
              <TextArea
                id={id}
                rows={3}
                value={draft.explanation}
                onChange={(e) =>
                  onChange({ ...draft, explanation: e.target.value })
                }
              />
            )}
          </Field>
        </>
      );

    case "reflection":
      return (
        <>
          <Field label="Pergunta">
            {(id) => (
              <TextArea
                id={id}
                rows={2}
                value={draft.question}
                onChange={(e) => onChange({ ...draft, question: e.target.value })}
              />
            )}
          </Field>

          <PlainOptions
            options={draft.options}
            onChange={(options) => onChange({ ...draft, options })}
          />

          <label className="flex min-h-touch items-center gap-3 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={draft.allowMultiple}
              onChange={(e) =>
                onChange({ ...draft, allowMultiple: e.target.checked })
              }
              className="size-5 accent-[var(--color-aurora-500)]"
            />
            Pode marcar mais de uma
          </label>
        </>
      );

    case "verse":
      return (
        <Field
          label="Comentário"
          hint="O que você quer destacar nesse texto. Opcional."
        >
          {(id) => (
            <TextArea
              id={id}
              rows={3}
              value={draft.comment}
              onChange={(e) => onChange({ ...draft, comment: e.target.value })}
            />
          )}
        </Field>
      );

    case "open_question":
      return (
        <>
          <Field label="Pergunta">
            {(id) => (
              <TextArea
                id={id}
                rows={2}
                value={draft.question}
                onChange={(e) => onChange({ ...draft, question: e.target.value })}
              />
            )}
          </Field>
          <Field label="Texto de apoio no campo" hint="Opcional.">
            {(id) => (
              <TextInput
                id={id}
                value={draft.placeholder}
                onChange={(e) =>
                  onChange({ ...draft, placeholder: e.target.value })
                }
                placeholder="Escreva do seu jeito..."
              />
            )}
          </Field>
        </>
      );
  }
}

type RichOption = ReturnType<typeof blankRichOption>;

function RichOptions({
  options,
  onChange,
}: {
  options: RichOption[];
  onChange: (options: RichOption[]) => void;
}) {
  function update(index: number, patch: Partial<RichOption>) {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-ink-muted">
        Alternativas
      </legend>
      <p className="-mt-1 text-xs text-ink-subtle">
        A reflexão fica em cada alternativa: é o que faz o retorno explicar a
        escolha que o adolescente fez, em vez de dizer certo ou errado.
      </p>

      {options.map((option, index) => (
        <div
          key={option.id}
          className="flex flex-col gap-3 rounded-field border border-line bg-surface-overlay p-4"
        >
          <div className="flex items-start gap-2">
            <span className="mt-3 flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-xs font-semibold text-ink-subtle">
              {String.fromCharCode(65 + index)}
            </span>
            <TextInput
              value={option.label}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Texto da alternativa"
              aria-label={`Alternativa ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => onChange(options.filter((_, i) => i !== index))}
              disabled={options.length <= 2}
              aria-label={`Remover alternativa ${index + 1}`}
              className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-ink-subtle hover:text-red-300 disabled:opacity-30"
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>

          <TextArea
            rows={2}
            value={option.reflection}
            onChange={(e) => update(index, { reflection: e.target.value })}
            placeholder="Reflexão de quem escolher esta alternativa"
            aria-label={`Reflexão da alternativa ${index + 1}`}
          />

          <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
            <TextInput
              value={option.scriptureRef}
              onChange={(e) => update(index, { scriptureRef: e.target.value })}
              placeholder="Referência (opcional)"
              aria-label={`Referência da alternativa ${index + 1}`}
            />
            <TextInput
              value={option.scriptureText}
              onChange={(e) => update(index, { scriptureText: e.target.value })}
              placeholder="Texto do versículo (opcional)"
              aria-label={`Versículo da alternativa ${index + 1}`}
            />
          </div>
        </div>
      ))}

      {options.length < 6 ? (
        <Button onClick={() => onChange([...options, blankRichOption()])}>
          <Plus aria-hidden className="size-4" />
          Alternativa
        </Button>
      ) : null}
    </fieldset>
  );
}

type PlainOption = ReturnType<typeof blankPlainOption>;

function PlainOptions({
  options,
  onChange,
}: {
  options: PlainOption[];
  onChange: (options: PlainOption[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-ink-muted">Opções</legend>
      <p className="-mt-1 text-xs text-ink-subtle">
        Palavras curtas, tipo etiqueta: Deus, Família, Amigos, Redes sociais.
      </p>

      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <TextInput
              value={option.label}
              onChange={(e) =>
                onChange(
                  options.map((o, i) =>
                    i === index ? { ...o, label: e.target.value } : o,
                  ),
                )
              }
              aria-label={`Opção ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => onChange(options.filter((_, i) => i !== index))}
              disabled={options.length <= 2}
              aria-label={`Remover opção ${index + 1}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink-subtle hover:text-red-300 disabled:opacity-30"
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {options.length < 12 ? (
        <Button onClick={() => onChange([...options, blankPlainOption()])}>
          <Plus aria-hidden className="size-4" />
          Opção
        </Button>
      ) : null}
    </fieldset>
  );
}
