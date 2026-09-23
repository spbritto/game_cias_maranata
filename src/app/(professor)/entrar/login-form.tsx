"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";
import { entrarAction, type LoginState } from "../actions";
import { Button, Field, TextInput } from "@/components/professor/ui";

export function LoginForm({ destino }: { destino: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(
    entrarAction,
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="destino" value={destino} />

      <Field label="E-mail">
        {(id) => (
          <TextInput
            id={id}
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
        )}
      </Field>

      <Field label="Senha">
        {(id) => (
          <TextInput
            id={id}
            name="senha"
            type="password"
            autoComplete="current-password"
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
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      <LogIn aria-hidden className="size-4" />
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}
