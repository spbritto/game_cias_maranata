"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "dirty" | "saving" | "error";

/**
 * Autosave com atraso.
 *
 * O professor escreve texto longo, então salvar a cada tecla seria absurdo e
 * um botão "Salvar" seria mais uma coisa para ele esquecer. O meio-termo é
 * esperar uma pausa na digitação.
 *
 * Garantias que a versão ingênua não tem:
 *  - salva antes de fechar a aba, se houver alteração pendente;
 *  - ignora resposta de gravação antiga que chegue depois de uma mais nova,
 *    para o status não piscar "salvo" quando ainda há coisa por salvar;
 *  - se a própria chamada de rede falhar (não só a validação), mostra erro em
 *    vez de ficar presa em "Salvando..." para sempre;
 *  - expõe `retry()` para tentar de novo sem exigir uma nova edição.
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
  /**
   * `attempt()` sempre lê o valor mais recente, mesmo chamado fora do efeito
   * (por `retry()`, num clique). Atualizado dentro do efeito abaixo, nunca
   * durante o render — escrever em ref durante o render é efeito colateral e
   * pode rodar mais de uma vez sob renderização concorrente.
   */
  const valueRef = useRef(value);

  const attempt = useCallback(async () => {
    const mine = ++generation.current;
    setStatus("saving");

    // O try/catch importa: sem rede, ou com o servidor fora do ar, a chamada
    // rejeita em vez de devolver `{ ok: false }`. Sem isso a tela ficava presa
    // em "Salvando..." para sempre, sem nenhum aviso.
    let result: { ok: boolean; error?: string };
    try {
      result = await save(valueRef.current);
    } catch {
      result = {
        ok: false,
        error:
          "Sem conexão com o servidor. O que você digitou continua na tela — tente de novo em instantes.",
      };
    }

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
  }, [save]);

  useEffect(() => {
    valueRef.current = value;

    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    pending.current = true;
    setStatus("dirty");

    const timer = window.setTimeout(attempt, delay);
    return () => window.clearTimeout(timer);
  }, [value, delay, attempt]);

  // Rede caindo ou aba fechando no meio de uma edição: avisa antes de perder.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (pending.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // `retry` chama a mesma tentativa direto, sem esperar o debounce — o
  // professor já pediu explicitamente para tentar agora.
  return { status, error, retry: attempt };
}
