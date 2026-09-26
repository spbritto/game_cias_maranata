"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Check, KeyRound } from "lucide-react";
import {
  alterarSenhaAction,
  type AlterarSenhaState,
} from "@/app/(professor)/actions";
import { Button, Field, TextInput } from "./ui";

const INITIAL: AlterarSenhaState = { error: null, success: false };

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(alterarSenhaAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa os campos após trocar com sucesso — a senha antiga digitada não
  // deve continuar visível/preenchida na tela.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <Field label="Senha atual">
        {(id) => (
          <TextInput
            id={id}
            name="senhaAtual"
            type="password"
            autoComplete="current-password"
            required
          />
        )}
      </Field>

      <Field label="Nova senha" hint="Pelo menos 8 caracteres.">
        {(id) => (
          <TextInput
            id={id}
            name="novaSenha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      <Field label="Confirmar nova senha">
        {(id) => (
          <TextInput
            id={id}
            name="confirmacao"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      {state.error ? (
        <p
          role="alert"
          className="rounded-field border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-field border border-ember-500/40 bg-ember-500/10 px-4 py-3 text-sm text-ember-300"
        >
          <Check aria-hidden className="size-4 shrink-0" />
          Senha alterada.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      <KeyRound aria-hidden className="size-4" />
      {pending ? "Salvando..." : "Salvar nova senha"}
    </Button>
  );
}
