"use client";

import { useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "dirty" | "saving" | "error";

/**
 * Autosave com atraso.
 *
 * O professor escreve texto longo, então salvar a cada tecla seria absurdo e
 * um botão "Salvar" seria mais uma coisa para ele esquecer. O meio-termo é
 * esperar uma pausa na digitação.
 *
 * Duas garantias que a versão ingênua não tem:
 *  - salva antes de fechar a aba, se houver alteração pendente;
 *  - ignora resposta de gravação antiga que chegue depois de uma mais nova,
 *    para o status não piscar "salvo" quando ainda há coisa por salvar.
 */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<{ ok: boolean; error?: string }>,
  { delay = 900 }: { delay?: number } = {},
) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);

  /** Primeiro render não salva: o valor veio do banco, não do professor. */
  const mounted = useRef(false);
  const generation = useRef(0);
  const pending = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    pending.current = true;
    setStatus("dirty");

    const timer = window.setTimeout(async () => {
      const mine = ++generation.current;
      setStatus("saving");

      // `value` aqui é sempre o mais recente: o efeito re-roda a cada mudança
      // e o `clearTimeout` do cleanup cancela o agendamento anterior.
      const result = await save(value);

      // Chegou depois de uma gravação mais nova ter começado: descarta.
      if (mine !== generation.current) return;

      if (result.ok) {
        pending.current = false;
        setError(null);
        setStatus("saved");
      } else {
        setError(result.error ?? "Não consegui salvar.");
        setStatus("error");
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, save, delay]);

  // Rede caindo ou aba fechando no meio de uma edição: avisa antes de perder.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (pending.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return { status, error };
}
