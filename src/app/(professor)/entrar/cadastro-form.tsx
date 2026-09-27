"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, UserPlus } from "lucide-react";
import { cadastrarAction, type CadastroState } from "../actions";
import { Button, Field, TextInput } from "@/components/professor/ui";
import { rememberEmail } from "@/lib/remembered-email";

export function CadastroForm({ destino }: { destino: string }) {
  const [state, formAction] = useActionState<CadastroState, FormData>(
    cadastrarAction,
    { error: null },
  );

  return (
    <form
      action={formAction}
      // Quem acabou de criar a conta já volta com o e-mail preenchido.
      onSubmit={(e) => {
        const email = new FormData(e.currentTarget).get("email");
        if (typeof email === "string" && email) rememberEmail(email);
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="destino" value={destino} />

      <Field label="Nome">
        {(id) => (
          <TextInput
            id={id}
            name="nome"
            type="text"
            autoComplete="name"
            required
            autoFocus
          />
        )}
      </Field>

      <Field label="E-mail">
        {(id) => (
          <TextInput
            id={id}
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        )}
      </Field>

      <Field label="Senha" hint="Pelo menos 8 caracteres.">
        {(id) => (
          <TextInput
            id={id}
            name="senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      <Field
        label="Código de convite"
        hint="Combinado com quem administra o sistema."
      >
        {(id) => (
          <TextInput
            id={id}
            name="convite"
            type="text"
            autoComplete="off"
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

      <SubmitButton />

      <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
        <KeyRound aria-hidden className="size-3.5 shrink-0" />
        O código de convite é o que mantém o cadastro fora do alcance de quem
        só encontrou o site.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      <UserPlus aria-hidden className="size-4" />
      {pending ? "Criando conta..." : "Criar conta"}
    </Button>
  );
}
