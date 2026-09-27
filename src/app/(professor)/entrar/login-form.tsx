"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";
import { entrarAction, type LoginState } from "../actions";
import { Button, Field, TextInput } from "@/components/professor/ui";
import {
  forgetEmail,
  readRememberedEmail,
  rememberEmail,
} from "@/lib/remembered-email";

/** O e-mail lembrado não muda por fora durante a vida desta tela. */
const noSubscribe = () => () => {};

export function LoginForm({ destino }: { destino: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(
    entrarAction,
    { error: null },
  );

  /*
    `localStorage` só existe no navegador: no servidor (e na hidratação) isto é
    null, e logo depois vira o e-mail lembrado. O `key` abaixo remonta os
    campos nessa virada, para o `defaultValue` e o `autoFocus` valerem.
  */
  const remembered = useSyncExternalStore(
    noSubscribe,
    readRememberedEmail,
    () => null,
  );
  const [remember, setRemember] = useState(true);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const email = new FormData(e.currentTarget).get("email");
        if (remember && typeof email === "string" && email) {
          rememberEmail(email);
        } else {
          forgetEmail();
        }
      }}
      className="flex flex-col gap-5"
      key={remembered ?? "sem-email"}
    >
      <input type="hidden" name="destino" value={destino} />

      <Field label="E-mail">
        {(id) => (
          <TextInput
            id={id}
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={remembered ?? ""}
            required
            autoFocus={!remembered}
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
            autoFocus={Boolean(remembered)}
          />
        )}
      </Field>

      <label className="flex min-h-touch cursor-pointer items-center gap-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-5 accent-[var(--color-ember-400)]"
        />
        Lembrar meu e-mail neste aparelho
      </label>

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
