"use client";

import { useSyncExternalStore } from "react";

/** A origem não muda durante a vida da página: nunca há o que notificar. */
const subscribe = () => () => {};

/**
 * Origem real do navegador ("https://...", ou o IP da rede local), segura para
 * renderização no servidor: devolve "" lá e o valor real depois da hidratação,
 * sem divergência de hidratação e sem `setState` dentro de efeito.
 *
 * Importa porque o professor abre o painel de um aparelho e o link precisa
 * apontar para onde ele está de fato — não para a URL configurada no ambiente.
 */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}
