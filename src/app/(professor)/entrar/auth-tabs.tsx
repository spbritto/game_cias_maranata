"use client";

import { useState } from "react";
import { CadastroForm } from "./cadastro-form";
import { LoginForm } from "./login-form";
import { cn } from "@/lib/utils";

/**
 * Alterna entre entrar e criar conta na mesma tela, em vez de uma rota
 * separada — é o que foi pedido: cadastro na própria tela de login.
 */
export function AuthTabs({ destino }: { destino: string }) {
  const [mode, setMode] = useState<"entrar" | "cadastrar">("entrar");

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Entrar ou criar conta"
        className="grid grid-cols-2 gap-1 rounded-pill border border-line bg-surface-raised p-1"
      >
        <TabButton active={mode === "entrar"} onClick={() => setMode("entrar")}>
          Entrar
        </TabButton>
        <TabButton
          active={mode === "cadastrar"}
          onClick={() => setMode("cadastrar")}
        >
          Criar conta
        </TabButton>
      </div>

      {mode === "entrar" ? (
        <LoginForm destino={destino} />
      ) : (
        <CadastroForm destino={destino} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "min-h-touch rounded-pill text-sm font-semibold transition-colors",
        active
          ? "bg-accent text-night-950"
          : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
